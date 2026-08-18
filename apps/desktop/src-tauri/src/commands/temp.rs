use std::path::PathBuf;

/// Mirrors the Node services' `mkdtemp(tmpdir(), 'brief-ai-<feature>-')` +
/// `finally { rm(workDir, { recursive: true, force: true }) }` pattern —
/// `Drop` is Rust's equivalent of that `finally` block, and it fires on
/// early-return/error paths automatically, not just the success path.
pub struct TempWorkDir(pub PathBuf);

impl TempWorkDir {
    pub fn new(prefix: &str) -> std::io::Result<Self> {
        let dir = std::env::temp_dir().join(format!("{prefix}-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&dir)?;
        Ok(Self(dir))
    }

    pub fn path(&self) -> &PathBuf {
        &self.0
    }
}

impl Drop for TempWorkDir {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
    }
}

/// Resolves a bundled binary's path. Checks the same env var name the Node
/// services already use (e.g. `QPDF_BIN`) first, so Rust command development
/// can proceed against a system-installed binary before the per-OS sidecar
/// bundling is finished; falls back to the actual on-disk sidecar path in
/// release/bundled builds.
///
/// Deliberately doesn't go through `app.shell().sidecar(name)` —
/// tauri-plugin-shell's `Command` wraps a private `std::process::Command`
/// with no accessor for the resolved path, only spawn/output methods on its
/// own type. That would mean rewriting `run_with_timeout`'s custom
/// kill-on-timeout handling (see mod.rs) around a second, differently-shaped
/// process API just to get a path this function can return just as
/// correctly by replicating the shell plugin's own resolution logic
/// directly: `current_exe()`'s directory + the sidecar's filename.
///
/// Source files under `src-tauri/binaries/` need the target-triple suffix
/// (`qpdf-x86_64-pc-windows-msvc.exe`, per tauri.conf.json's externalBin
/// convention) so Tauri's build step picks the right binary for the host
/// platform — but the installed, bundled copy sitting next to app.exe does
/// NOT keep that suffix; it's just `qpdf.exe`. Verified directly against a
/// real NSIS-installed build rather than assumed.
pub fn resolve_binary(_app: &tauri::AppHandle, env_var: &str, sidecar_name: &str) -> Result<PathBuf, String> {
    if let Ok(path) = std::env::var(env_var) {
        return Ok(PathBuf::from(path));
    }

    let exe_dir = std::env::current_exe()
        .map_err(|e| format!("Could not resolve current executable path: {e}"))?
        .parent()
        .ok_or("Current executable has no parent directory")?
        .to_path_buf();

    let sidecar_path = exe_dir.join(format!("{sidecar_name}.exe"));

    if !sidecar_path.exists() {
        return Err(format!(
            "Bundled binary '{sidecar_name}' not found at {}. Set {env_var} to a system-installed binary for local dev.",
            sidecar_path.display()
        ));
    }
    Ok(sidecar_path)
}
