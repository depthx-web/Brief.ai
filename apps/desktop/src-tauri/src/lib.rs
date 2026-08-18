mod commands;

use commands::office_worker::OfficeWorker;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_fs::init())
    .manage(OfficeWorker::new())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::protect::protect_pdf,
      commands::unlock::unlock_pdf,
      commands::compress::compress_pdf,
      commands::office_convert::office_convert,
      commands::office_convert::office_convert_direct_spawn,
      commands::pdf_to_html::pdf_to_html,
    ])
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|app_handle, event| {
      if let tauri::RunEvent::Exit = event {
        app_handle.state::<OfficeWorker>().kill_on_exit();
      }
    });
}
