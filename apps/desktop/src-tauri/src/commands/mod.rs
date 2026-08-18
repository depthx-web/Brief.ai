pub mod compress;
pub mod office_convert;
pub mod office_worker;
pub mod pdf_to_html;
pub mod protect;
pub mod temp;
pub mod unlock;

use std::path::Path;
use std::time::Duration;
use tokio::io::AsyncReadExt;
use tokio::process::Command;

/// Shared timeout wrapper matching the Node services' `CONVERSION_TIMEOUT_MS`
/// default (60s) + SIGKILL-on-expiry behavior. `child.kill()` on Windows maps
/// to TerminateProcess, the same hard-stop semantics as SIGKILL on Unix.
///
/// Deliberately doesn't use `Child::wait_with_output()` — it consumes the
/// child, so once raced against a timeout there'd be no handle left to
/// actually kill on expiry (the process would just be silently orphaned
/// instead of terminated). Takes the piped stdout/stderr handles out first,
/// reads them concurrently, and races only `child.wait()` (which only needs
/// `&mut self`) against the timeout so `child.kill()` stays reachable.
pub async fn run_with_timeout(mut cmd: Command, timeout_secs: u64) -> Result<std::process::Output, String> {
    // app.exe is a GUI-subsystem process with no console of its own; without
    // CREATE_NO_WINDOW, a spawned console-subsystem child (qpdf, gs, soffice)
    // gets an implicitly allocated new console, which for soffice's own
    // internal soffice.exe->soffice.bin handoff was empirically the source
    // of an intermittent "bootstrap.ini is corrupt" dialog + hang during the
    // bundling spike — reproducible when launched this way, absent when
    // launched with an explicit no-window flag (verified via direct testing
    // outside the app; piped stdio alone did not reproduce it).
    #[cfg(windows)]
    {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let mut child = cmd
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to launch process: {e}"))?;

    let mut stdout_pipe = child.stdout.take().expect("stdout was piped");
    let mut stderr_pipe = child.stderr.take().expect("stderr was piped");
    let stdout_task = tokio::spawn(async move {
        let mut buf = Vec::new();
        let _ = stdout_pipe.read_to_end(&mut buf).await;
        buf
    });
    let stderr_task = tokio::spawn(async move {
        let mut buf = Vec::new();
        let _ = stderr_pipe.read_to_end(&mut buf).await;
        buf
    });

    let status = match tokio::time::timeout(Duration::from_secs(timeout_secs), child.wait()).await {
        Ok(result) => result.map_err(|e| format!("Process failed: {e}"))?,
        Err(_) => {
            let _ = child.kill().await;
            let _ = child.wait().await;
            return Err(format!("Process timed out after {timeout_secs}s and was terminated"));
        }
    };

    let stdout = stdout_task.await.unwrap_or_default();
    let stderr = stderr_task.await.unwrap_or_default();
    Ok(std::process::Output { status, stdout, stderr })
}

/// Scans a directory for the first file ending in the given extension —
/// mirrors the Node services' pattern for tools whose output filename isn't
/// deterministic (soffice, pdftohtml both pick their own output name).
pub fn find_output_by_extension(dir: &Path, extension: &str) -> Result<std::path::PathBuf, String> {
    let suffix = format!(".{extension}");
    std::fs::read_dir(dir)
        .map_err(|e| format!("Could not read output directory: {e}"))?
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .find(|path| path.to_string_lossy().ends_with(&suffix))
        .ok_or_else(|| format!("No output file with extension '{extension}' was produced"))
}
