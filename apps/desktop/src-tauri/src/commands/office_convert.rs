use super::office_worker::{convert_via_worker, OfficeWorker};
use super::temp::{resolve_binary, TempWorkDir};
use super::{find_output_by_extension, run_with_timeout};
use std::time::Instant;
use tokio::process::Command;

const ALLOWED_TARGET_FORMATS: [&str; 4] = ["pdf", "docx", "xlsx", "pptx"];

// LibreOffice's own internal filter names — not the same as file extensions.
// Source format matters for exporting *to* PDF (Writer vs Calc vs Impress
// each have their own PDF export filter); target format matters for
// exporting *from* PDF. Extend this table alongside ALLOWED_TARGET_FORMATS
// if more office formats are added.
fn resolve_filter_name(input_path: &str, target_format: &str) -> Result<&'static str, String> {
    let input_ext = std::path::Path::new(input_path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_ascii_lowercase())
        .unwrap_or_default();

    match (input_ext.as_str(), target_format) {
        ("doc" | "docx", "pdf") => Ok("writer_pdf_Export"),
        ("xls" | "xlsx", "pdf") => Ok("calc_pdf_Export"),
        ("ppt" | "pptx", "pdf") => Ok("impress_pdf_Export"),
        ("pdf", "docx") => Ok("MS Word 2007 XML"),
        ("pdf", "xlsx") => Ok("Calc MS Excel 2007 XML"),
        ("pdf", "pptx") => Ok("Impress MS PowerPoint 2007 XML"),
        _ => Err(format!(
            "No export filter known for '{input_ext}' -> '{target_format}'"
        )),
    }
}

// Persistent-UNO-worker-backed conversion — the default path. See
// scripts/uno_convert.py and office_worker.rs for the full rationale: the
// per-request direct-spawn approach below (kept as office_convert_direct_spawn)
// was found to fail consistently when launched from app.exe specifically
// during soffice's own startup, never when launched from a console. This
// starts soffice's engine once and serves every conversion after that over
// a UNO socket via a lightweight Python helper that never re-enters that
// startup path.
#[tauri::command]
pub async fn office_convert(
    app: tauri::AppHandle,
    worker: tauri::State<'_, OfficeWorker>,
    input_path: String,
    target_format: String,
) -> Result<String, String> {
    if !ALLOWED_TARGET_FORMATS.contains(&target_format.as_str()) {
        return Err(format!(
            "Invalid target format '{target_format}' — expected one of {ALLOWED_TARGET_FORMATS:?}"
        ));
    }
    let filter_name = resolve_filter_name(&input_path, &target_format)?;

    let final_path = std::env::temp_dir().join(format!(
        "brief-ai-result-{}.{target_format}",
        uuid::Uuid::new_v4()
    ));

    convert_via_worker(
        &app,
        &worker,
        &input_path,
        &final_path.to_string_lossy(),
        filter_name,
    )
    .await?;

    Ok(final_path.to_string_lossy().to_string())
}

// DIAGNOSTIC / FALLBACK PATH — not called by the frontend by default (see
// office_convert above for the default UNO-worker-backed path). Kept as a
// regression tool: if office_convert (worker-backed) succeeds reliably
// while this direct-spawn version keeps failing, that's strong confirmation
// the architecture change is what actually fixed the underlying problem,
// not something incidental.
//
// Ports apps/api/src/conversion/conversion.service.ts's `runSoffice`
// (conversion.service.ts:145-187). Serves both directions (Office->PDF and
// PDF->Office) — same soffice CLI shape either way, just a different
// target_format, mirroring how the Node side shares one function for both:
//   soffice --headless --nologo --nofirststartwizard --norestore
//           -env:UserInstallation=file://<profileDir>
//           --convert-to <targetFormat> --outdir <outDir> <inputPath>
//
// Critical detail preserved from the Node source: a FRESH profile dir per
// request. Concurrent soffice processes sharing one profile dir lock each
// other out — verified this empirically during the bundling spike (two
// concurrent conversions with separate profile dirs both completed; sharing
// one profile dir is the documented failure mode this avoids).
//
// KNOWN LIMITATION: spawning soffice directly from a console (batch file,
// PowerShell) succeeds reliably, every time, on this exact bundled install
// — but the identical command spawned from app.exe fails consistently. The
// specific symptom flips depending on CREATE_NO_WINDOW (set centrally in
// `run_with_timeout`): with it, soffice exits almost immediately with
// `libpng error: Write Error`; without it, soffice.bin shows a blocking
// "bootstrap.ini is corrupt" GUI dialog that headless mode does not
// suppress, hanging until the timeout kills it. Ruled out empirically:
// profile reuse/locking (fresh UUID profile dir every call), a corrupted
// install tree (freshly re-extracted, verified working via direct
// invocation immediately beforehand, still fails from app.exe), launch CWD,
// USERPROFILE/HOME/TEMP/TMP redirection, and routing through an
// intermediate cmd.exe console-subsystem hop (same failure either way).
#[tauri::command]
pub async fn office_convert_direct_spawn(app: tauri::AppHandle, input_path: String, target_format: String) -> Result<String, String> {
    if !ALLOWED_TARGET_FORMATS.contains(&target_format.as_str()) {
        return Err(format!(
            "Invalid target format '{target_format}' — expected one of {ALLOWED_TARGET_FORMATS:?}"
        ));
    }

    let conversion_id = uuid::Uuid::new_v4();
    let soffice = resolve_binary(&app, "SOFFICE_BIN", "soffice")?;
    let work = TempWorkDir::new("brief-ai-office").map_err(|e| e.to_string())?;
    let profile_dir = work.path().join("profile");
    let out_dir = work.path().join("out");
    std::fs::create_dir_all(&profile_dir).map_err(|e| format!("Could not create profile dir: {e}"))?;
    std::fs::create_dir_all(&out_dir).map_err(|e| format!("Could not create output dir: {e}"))?;

    log::info!(
        "office_convert[{conversion_id}]: soffice={} profile={} out={} input={input_path} target={target_format}",
        soffice.display(),
        profile_dir.display(),
        out_dir.display()
    );

    // file:// URL needs forward slashes even on Windows.
    let profile_url = format!("file://{}", profile_dir.to_string_lossy().replace('\\', "/"));

    let mut cmd = Command::new(&soffice);
    // soffice.exe forwards its own launch CWD to the soffice.bin engine via
    // an internal `-env:OOO_CWD=` argument. Left unset, it inherits
    // app.exe's CWD (the Tauri app's own working directory); pinning it to
    // soffice's own program directory removes it as a variable, though it
    // did not on its own resolve the failure documented below.
    if let Some(program_dir) = soffice.parent() {
        cmd.current_dir(program_dir);
    }
    cmd.args([
        "--headless",
        "--nologo",
        "--nofirststartwizard",
        "--norestore",
        &format!("-env:UserInstallation={profile_url}"),
        "--convert-to",
        &target_format,
        "--outdir",
        out_dir.to_string_lossy().as_ref(),
        &input_path,
    ]);

    let started = Instant::now();
    // soffice conversions are slower than qpdf/gs — give it more headroom
    // than the 60s default the other three commands use. 180s (not the
    // originally planned 120s) leaves room for slow cold-profile starts
    // under real-world memory pressure, observed directly during the
    // bundling spike on a loaded machine.
    let output = run_with_timeout(cmd, 180).await;
    let elapsed_ms = started.elapsed().as_millis();

    let output = match output {
        Ok(output) => output,
        Err(e) => {
            log::warn!("office_convert[{conversion_id}]: failed after {elapsed_ms}ms: {e}");
            return Err(e);
        }
    };

    log::info!(
        "office_convert[{conversion_id}]: exited after {elapsed_ms}ms status={:?} stderr={}",
        output.status.code(),
        String::from_utf8_lossy(&output.stderr)
    );

    if !output.status.success() {
        return Err(format!(
            "soffice conversion failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    // Output filename isn't fixed — soffice picks its own — so scan for it,
    // same as the Node version.
    let produced = find_output_by_extension(&out_dir, &target_format)?;

    let final_path = std::env::temp_dir().join(format!(
        "brief-ai-result-{conversion_id}.{target_format}"
    ));
    std::fs::copy(&produced, &final_path).map_err(|e| format!("Could not finalize output: {e}"))?;
    Ok(final_path.to_string_lossy().to_string())
}
