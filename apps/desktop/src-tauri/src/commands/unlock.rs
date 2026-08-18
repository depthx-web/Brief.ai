use super::temp::{resolve_binary, TempWorkDir};
use super::run_with_timeout;
use tokio::process::Command;

// Ports apps/api/src/password/password.service.ts's `unlock` method:
//   qpdf --password=<password> --decrypt <inputPath> <outputPath>
#[tauri::command]
pub async fn unlock_pdf(app: tauri::AppHandle, input_path: String, password: String) -> Result<String, String> {
    let qpdf = resolve_binary(&app, "QPDF_BIN", "qpdf")?;
    let work = TempWorkDir::new("brief-ai-unlock").map_err(|e| e.to_string())?;
    let output_path = work.path().join("output.pdf");

    let mut cmd = Command::new(qpdf);
    cmd.args([
        &format!("--password={password}"),
        "--decrypt",
        &input_path,
        output_path.to_string_lossy().as_ref(),
    ]);

    let output = run_with_timeout(cmd, 60).await?;
    if !output.status.success() {
        return Err(format!(
            "qpdf --decrypt failed (check the password): {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }
    if !output_path.exists() {
        return Err("qpdf reported success but produced no output file".to_string());
    }

    let final_path = std::env::temp_dir().join(format!("brief-ai-result-{}.pdf", uuid::Uuid::new_v4()));
    std::fs::copy(&output_path, &final_path).map_err(|e| format!("Could not finalize output: {e}"))?;
    Ok(final_path.to_string_lossy().to_string())
}
