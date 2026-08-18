use super::temp::{resolve_binary, TempWorkDir};
use super::{find_output_by_extension, run_with_timeout};
use tokio::process::Command;

// Ports apps/api/src/conversion/conversion.service.ts's `runPdfToHtml`
// (conversion.service.ts:117-143):
//   pdftohtml -s -noframes -q <inputPath> <outputBase>
// -s bundles every page into one output file, -noframes drops poppler's
// legacy frameset wrapper, -q is quiet. Output filename isn't fixed (poppler
// appends its own extension to outputBase), so scan for it like office_convert does.
#[tauri::command]
pub async fn pdf_to_html(app: tauri::AppHandle, input_path: String) -> Result<String, String> {
    let pdftohtml = resolve_binary(&app, "PDFTOHTML_BIN", "pdftohtml")?;
    let work = TempWorkDir::new("brief-ai-html").map_err(|e| e.to_string())?;
    let output_base = work.path().join("output");

    let mut cmd = Command::new(pdftohtml);
    cmd.args([
        "-s",
        "-noframes",
        "-q",
        &input_path,
        output_base.to_string_lossy().as_ref(),
    ]);

    let output = run_with_timeout(cmd, 60).await?;
    if !output.status.success() {
        return Err(format!(
            "pdftohtml conversion failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let produced = find_output_by_extension(work.path(), "html")?;

    let final_path = std::env::temp_dir().join(format!("brief-ai-result-{}.html", uuid::Uuid::new_v4()));
    std::fs::copy(&produced, &final_path).map_err(|e| format!("Could not finalize output: {e}"))?;
    Ok(final_path.to_string_lossy().to_string())
}
