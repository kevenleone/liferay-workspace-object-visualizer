// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {

  println!(r#"
  _     _  __                                           
 | |   (_)/ _| ___ _ __ __ _ _   _                      
 | |   | | |_ / _ \ '__/ _` | | | |                     
 | |___| |  _|  __/ | | (_| | |_| |                     
 |_____|_|_|  \___|_|  \__,_|\__, |                   _ 
 |  _ \| | __ _ _   _  __ _ _|___/__  _   _ _ __   __| |
 | |_) | |/ _` | | | |/ _` | '__/ _ \| | | | '_ \ / _` |
 |  __/| | (_| | |_| | (_| | | | (_) | |_| | | | | (_| |
 |_|   |_|\__,_|\__, |\__, |_|  \___/ \__,_|_| |_|\__,_|
                |___/ |___/                             
  "#);

  app_lib::run();
}
