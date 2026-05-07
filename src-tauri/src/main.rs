#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};

#[tauri::command]
fn sembunyikan_jendela(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_always_on_top(false);
        std::thread::sleep(std::time::Duration::from_millis(100));
        let _ = window.hide();
    }
}

#[tauri::command]
fn munculkan_jendela(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.set_always_on_top(true);
    }
}
#[tauri::command]
fn matikan_aplikasi() {
    std::process::exit(0);
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
                let _ = window.set_always_on_top(true);
            }
        }))
        .invoke_handler(tauri::generate_handler![
            sembunyikan_jendela,
            munculkan_jendela,
            matikan_aplikasi
        ])
        .setup(|app| {
            let buka =
                MenuItem::with_id(app, "buka", "🔥 Buka Paksa Sekarang", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "💀 Keluar (Menyerah)", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&buka, &quit])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.set_always_on_top(true);
                            let _ = window.emit("tampilkan-rapor", ());
                        }
                    }
                    "buka" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.set_always_on_top(true);
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.set_always_on_top(true);
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                let _ = window.hide();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
