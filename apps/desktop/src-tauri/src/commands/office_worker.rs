use super::temp::resolve_binary;
use std::path::PathBuf;
use std::time::Duration;
use tokio::process::Command;
use tokio::sync::Mutex;

// See scripts/uno_convert.py for why this exists: direct-spawn-per-request
// (office_convert_direct_spawn) fails consistently when soffice is launched
// from app.exe via CreateProcess, specifically during soffice's own engine
// startup — but never when launched from an interactive console. Isolated
// across ~30 runs during the bundling spike (fresh profiles, fresh
// installs, CWD pinning, env redirection, an intermediate cmd.exe hop, and
// toggling CREATE_NO_WINDOW all ruled out as the cause or the fix). This
// worker starts soffice's engine exactly once — via ShellExecuteExW rather
// than CreateProcess, see spawn_listener_via_shell_execute below, since
// every prior CreateProcess-based attempt failed the same way regardless of
// flags — then serves every conversion after that over a UNO socket via a
// lightweight Python helper process that never re-enters soffice's own
// startup path at all.
const UNO_CONVERT_SCRIPT: &str = include_str!("../../scripts/uno_convert.py");
const WORKER_PORT: u16 = 2202;

/// A process handle obtained via ShellExecuteExW, which tokio::process::Child
/// can't represent (it only wraps CreateProcess-spawned children). Windows
/// HANDLEs are safe to hold and wait/query from any thread.
struct RawProcess {
    handle: isize,
}

#[cfg(windows)]
impl RawProcess {
    fn is_alive(&self) -> bool {
        use windows_sys::Win32::Foundation::WAIT_OBJECT_0;
        use windows_sys::Win32::System::Threading::WaitForSingleObject;
        // 0ms timeout: pure poll, never blocks. WAIT_OBJECT_0 means the
        // process handle is signaled, i.e. the process has already exited.
        let result = unsafe { WaitForSingleObject(self.handle as _, 0) };
        result != WAIT_OBJECT_0
    }

    fn kill(&self) {
        use windows_sys::Win32::System::Threading::TerminateProcess;
        unsafe {
            TerminateProcess(self.handle as _, 1);
        }
    }
}

impl Drop for RawProcess {
    fn drop(&mut self) {
        #[cfg(windows)]
        unsafe {
            windows_sys::Win32::Foundation::CloseHandle(self.handle as _);
        }
    }
}

// SAFETY: a Windows HANDLE is just an opaque, kernel-managed integer id —
// valid to use (wait on, query, close) from any thread, not tied to the
// thread that received it from ShellExecuteExW.
unsafe impl Send for RawProcess {}

pub struct OfficeWorkerState {
    listener: Option<RawProcess>,
    profile_dir: PathBuf,
    script_path: PathBuf,
    script_written: bool,
}

impl OfficeWorkerState {
    fn new() -> Self {
        let base = std::env::temp_dir().join("brief-ai-office-worker");
        Self {
            listener: None,
            profile_dir: base.join("profile"),
            script_path: base.join("uno_convert.py"),
            script_written: false,
        }
    }
}

pub struct OfficeWorker(Mutex<OfficeWorkerState>);

impl OfficeWorker {
    pub fn new() -> Self {
        Self(Mutex::new(OfficeWorkerState::new()))
    }
}

impl Default for OfficeWorker {
    fn default() -> Self {
        Self::new()
    }
}

impl OfficeWorker {
    /// Fire-and-forget kill for app shutdown (tauri::RunEvent::Exit is
    /// synchronous, so this can't await the graceful async path). try_lock
    /// rather than lock: shutdown shouldn't block waiting on an in-flight
    /// conversion's lock — better to leave a soffice.bin process for the OS
    /// to clean up than hang application exit.
    pub fn kill_on_exit(&self) {
        if let Ok(state) = self.0.try_lock() {
            if let Some(listener) = &state.listener {
                listener.kill();
            }
        }
    }
}

fn python_bin(soffice: &std::path::Path) -> Option<PathBuf> {
    soffice.parent().map(|program_dir| program_dir.join("python.exe"))
}

// Every manual test that reliably got soffice's engine through its own
// startup this session went through PowerShell's `Start-Process` — whether
// backed by ShellExecute or CreateProcess under the hood varies by how it's
// called, so what actually distinguishes the working recipe isn't a single
// Win32 API; it's specifically being launched by a running powershell.exe
// process rather than directly by app.exe. So: replicate that recipe
// exactly, rather than approximate it. app.exe spawns powershell.exe (a
// plain CreateProcess call — harmless, powershell.exe itself has no
// GUI-subsystem startup fragility of its own), and that powershell.exe
// process runs Start-Process against soffice, then prints back the PID so
// this can open a handle to it for liveness checks and kill.
async fn spawn_listener_via_powershell(exe: &std::path::Path, args: &str, cwd: &std::path::Path) -> Result<RawProcess, String> {
    let ps_command = format!(
        "$p = Start-Process -FilePath '{}' -ArgumentList '{}' -WorkingDirectory '{}' -WindowStyle Hidden -PassThru; Write-Output $p.Id",
        exe.display(),
        args.replace('\'', "''"),
        cwd.display(),
    );

    let mut cmd = Command::new("powershell.exe");
    cmd.args(["-NoProfile", "-NonInteractive", "-Command", &ps_command]);
    #[cfg(windows)]
    {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let output = super::run_with_timeout(cmd, 15).await?;
    if !output.status.success() {
        return Err(format!(
            "powershell.exe failed to launch soffice: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }
    let pid: u32 = String::from_utf8_lossy(&output.stdout)
        .trim()
        .parse()
        .map_err(|e| format!("Could not parse soffice PID from powershell output: {e}"))?;

    #[cfg(windows)]
    {
        use windows_sys::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_TERMINATE};
        const SYNCHRONIZE: u32 = 0x00100000;
        let handle = unsafe { OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_TERMINATE | SYNCHRONIZE, 0, pid) };
        if handle.is_null() {
            return Err(format!("Could not open handle to soffice process (pid {pid})"));
        }
        Ok(RawProcess { handle: handle as isize })
    }
    #[cfg(not(windows))]
    {
        let _ = pid;
        Err("Persistent office worker is only implemented for Windows".to_string())
    }
}

async fn spawn_listener(app: &tauri::AppHandle, state: &mut OfficeWorkerState) -> Result<(), String> {
    let soffice = resolve_binary(app, "SOFFICE_BIN", "soffice")?;
    let _ = std::fs::remove_dir_all(&state.profile_dir);
    std::fs::create_dir_all(&state.profile_dir).map_err(|e| format!("Could not create worker profile dir: {e}"))?;

    let profile_url = format!("file://{}", state.profile_dir.to_string_lossy().replace('\\', "/"));
    let accept = format!("socket,host=127.0.0.1,port={WORKER_PORT};urp;");
    let args = format!(
        "--headless --invisible --nologo --nofirststartwizard --norestore \"-env:UserInstallation={profile_url}\" \"--accept={accept}\""
    );
    let program_dir = soffice.parent().map(|p| p.to_path_buf()).unwrap_or_default();

    log::info!("office_worker: spawning persistent soffice listener on port {WORKER_PORT} via powershell Start-Process");

    let listener = spawn_listener_via_powershell(&soffice, &args, &program_dir).await?;

    state.listener = Some(listener);
    Ok(())
}

/// Returns whether a fresh spawn happened.
async fn ensure_listener_spawned(app: &tauri::AppHandle, state: &mut OfficeWorkerState) -> Result<bool, String> {
    let needs_spawn = match &state.listener {
        Some(listener) => !listener.is_alive(),
        None => true,
    };
    if needs_spawn {
        spawn_listener(app, state).await?;
    }
    if !state.script_written {
        std::fs::write(&state.script_path, UNO_CONVERT_SCRIPT)
            .map_err(|e| format!("Could not write uno_convert.py: {e}"))?;
        state.script_written = true;
    }
    Ok(needs_spawn)
}

enum ConvertOutcome {
    Ok,
    ConnectionRefused,
    Failed(String),
}

async fn try_convert_once(
    soffice: &std::path::Path,
    state: &OfficeWorkerState,
    input_path: &str,
    output_path: &str,
    filter_name: &str,
) -> Result<ConvertOutcome, String> {
    let python = python_bin(soffice).ok_or_else(|| "Could not resolve LibreOffice's bundled python.exe".to_string())?;

    let mut cmd = Command::new(&python);
    cmd.args([
        state.script_path.to_string_lossy().as_ref(),
        &WORKER_PORT.to_string(),
        input_path,
        output_path,
        filter_name,
    ]);
    // Note: this per-conversion Python helper still goes through
    // CreateProcess (via tokio) with CREATE_NO_WINDOW set in
    // run_with_timeout, same as every other command in this app. That's
    // fine here — it's a plain Python process with no GUI-subsystem
    // startup path of its own to trip over; the fragility that forced
    // ShellExecuteExW above is specific to soffice's own engine bootstrap.
    let output = super::run_with_timeout(cmd, 60).await?;
    let stderr = String::from_utf8_lossy(&output.stderr);

    if output.status.success() {
        Ok(ConvertOutcome::Ok)
    } else if stderr.contains("CONNECTION_REFUSED") {
        Ok(ConvertOutcome::ConnectionRefused)
    } else {
        Ok(ConvertOutcome::Failed(stderr.trim().to_string()))
    }
}

/// Converts one document via the persistent UNO worker, starting it if
/// necessary. Holds the worker's mutex for the whole call — conversions are
/// deliberately serialized against the single shared engine for now rather
/// than attempting concurrent UNO calls against one instance.
pub async fn convert_via_worker(
    app: &tauri::AppHandle,
    worker: &OfficeWorker,
    input_path: &str,
    output_path: &str,
    filter_name: &str,
) -> Result<(), String> {
    let mut state = worker.0.lock().await;
    let soffice = resolve_binary(app, "SOFFICE_BIN", "soffice")?;

    let fresh_spawn = ensure_listener_spawned(app, &mut state).await?;

    // DIAGNOSTIC: every manual test that connected only once, after waiting,
    // succeeded; every app-launched attempt that immediately started
    // retrying a connection once a second showed intermittent, CPU-idle
    // (genuinely stuck, not just slow) startup hangs. Untested hypothesis:
    // repeated failed connection attempts during soffice's own socket
    // bind/listen setup are corrupting that setup, rather than merely being
    // ignored. Testing it directly: stay completely silent — no connection
    // attempts of any kind — for a fixed window right after a fresh spawn,
    // before this loop makes its first attempt.
    if fresh_spawn {
        log::info!("office_worker: staying silent for 45s after fresh spawn before first connection attempt");
        tokio::time::sleep(Duration::from_secs(45)).await;
    }

    // The engine only needs to survive this fragile startup once per
    // process lifetime, not once per conversion. Measured directly during
    // the bundling spike: a ShellExecuteExW-launched cold startup on a
    // loaded machine took ~2m41s to actually bind its listening socket —
    // far longer than the ~10-40s a console-launched soffice takes. An
    // earlier, tighter retry budget here (30 attempts / ~21s before forcing
    // a respawn) was killing the listener while it was still mid-startup,
    // before it ever got a chance to finish — the respawn loop was fighting
    // its own patience budget, not a genuinely dead process. Generous on
    // purpose: this only costs time on the very first conversion after
    // (re)spawn; every conversion after that connects to an already-warm
    // engine in well under a second.
    let max_attempts: u32 = 300;
    let respawn_after_attempts: u32 = 240;
    for attempt in 1..=max_attempts {
        match try_convert_once(&soffice, &state, input_path, output_path, filter_name).await? {
            ConvertOutcome::Ok => return Ok(()),
            ConvertOutcome::Failed(msg) => return Err(format!("UNO conversion failed: {msg}")),
            ConvertOutcome::ConnectionRefused => {
                if attempt == respawn_after_attempts {
                    log::warn!("office_worker: still refused after {attempt} attempts (~{}s), forcing respawn", attempt);
                    if let Some(listener) = state.listener.take() {
                        listener.kill();
                    }
                    spawn_listener(app, &mut state).await?;
                }
                tokio::time::sleep(Duration::from_secs(3)).await;
            }
        }
    }

    Err("LibreOffice worker did not become ready in time".to_string())
}
