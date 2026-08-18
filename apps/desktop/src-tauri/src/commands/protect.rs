use super::temp::{resolve_binary, TempWorkDir};
use super::run_with_timeout;
use tokio::process::Command;

// Ports apps/api/src/password/password.service.ts's `protect` method:
//   qpdf --encrypt <userPassword> <ownerPassword||userPassword> 256 -- <inputPath> <outputPath>
#[tauri::command]
pub async fn protect_pdf(
    app: tauri::AppHandle,
    input_path: String,
    user_password: String,
    owner_password: Option<String>,
) -> Result<String, String> {
    let qpdf = resolve_binary(&app, "QPDF_BIN", "qpdf")?;
    let work = TempWorkDir::new("brief-ai-protect").map_err(|e| e.to_string())?;
    let output_path = work.path().join("output.pdf");

    let owner = owner_password.unwrap_or_else(|| user_password.clone());

    let mut cmd = Command::new(qpdf);
    cmd.args([
        "--encrypt",
        &user_password,
        &owner,
        "256",
        "--",
        &input_path,
        output_path.to_string_lossy().as_ref(),
    ]);

    let output = run_with_timeout(cmd, 60).await?;
    if !output.status.success() {
        return Err(format!(
            "qpdf --encrypt failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }
    if !output_path.exists() {
        return Err("qpdf reported success but produced no output file".to_string());
    }

    // Copy out of the temp dir before it's cleaned up on Drop at function
    // end — the frontend needs the file to still exist after this returns.
    let final_path = std::env::temp_dir().join(format!("brief-ai-result-{}.pdf", uuid::Uuid::new_v4()));
    std::fs::copy(&output_path, &final_path).map_err(|e| format!("Could not finalize output: {e}"))?;
    Ok(final_path.to_string_lossy().to_string())
}
