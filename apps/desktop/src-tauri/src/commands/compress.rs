use super::temp::{resolve_binary, TempWorkDir};
use super::run_with_timeout;
use tauri::Manager;
use tokio::process::Command;

// Mirrors COMPRESSION_PRESETS in apps/api/src/compression/compression.service.ts —
// keep this in sync with that list and with the labels shown in the web UI.
const VALID_PRESETS: [&str; 2] = ["ebook", "screen"];

// Ports apps/api/src/compression/compression.service.ts's `runGhostscript`:
//   gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/<preset>
//      -dNOPAUSE -dQUIET -dBATCH -dSAFER -sOutputFile=<outputPath> <inputPath>
#[tauri::command]
pub async fn compress_pdf(app: tauri::AppHandle, input_path: String, preset: String) -> Result<String, String> {
    if !VALID_PRESETS.contains(&preset.as_str()) {
        return Err(format!("Invalid preset '{preset}' — expected one of {VALID_PRESETS:?}"));
    }

    let gs = resolve_binary(&app, "GS_BIN", "gs")?;
    let work = TempWorkDir::new("brief-ai-compress").map_err(|e| e.to_string())?;
    let output_path = work.path().join("output.pdf");

    let mut cmd = Command::new(&gs);

    // Ghostscript needs its Resource/lib/iccprofiles trees to even start —
    // when running from a system install these sit at well-known relative
    // offsets from the exe it auto-discovers, but the bundled sidecar isn't
    // laid out that way (Tauri's resources land under the app's resource
    // dir, not GS's own expected layout). Passing -I explicitly sidesteps
    // needing to replicate GS's internal search-path guessing — only do
    // this for the bundled sidecar; a system-installed GS_BIN override
    // already knows where its own resources live.
    if std::env::var("GS_BIN").is_err() {
        if let Ok(resource_dir) = app.path().resource_dir() {
            let gs_resources = resource_dir.join("gs-resources");
            cmd.arg(format!("-I{}", gs_resources.join("lib").display()));
            cmd.arg(format!("-I{}", gs_resources.join("Resource").display()));
        }
    }

    cmd.args([
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        &format!("-dPDFSETTINGS=/{preset}"),
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        "-dSAFER",
        &format!("-sOutputFile={}", output_path.to_string_lossy()),
        &input_path,
    ]);

    let output = run_with_timeout(cmd, 60).await?;
    if !output.status.success() {
        return Err(format!(
            "Ghostscript compression failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }
    if !output_path.exists() {
        return Err("Ghostscript reported success but produced no output file".to_string());
    }

    let final_path = std::env::temp_dir().join(format!("brief-ai-result-{}.pdf", uuid::Uuid::new_v4()));
    std::fs::copy(&output_path, &final_path).map_err(|e| format!("Could not finalize output: {e}"))?;
    Ok(final_path.to_string_lossy().to_string())
}
