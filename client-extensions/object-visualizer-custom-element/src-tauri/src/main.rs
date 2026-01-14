// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]



fn main() {

  println!(r#"
  _     _  __                        ____        _        
  | |   (_)/ _| ___ _ __ __ _ _   _  |  _ \  __ _| |_ __ _ 
  | |   | | |_ / _ \ '__/ _` | | | | | | | |/ _` | __/ _` |
  | |___| |  _|  __/ | | (_| | |_| | | |_| | (_| | || (_| |
  |_____|_|_|  \___|_| _\__,_|\__, | |____/ \__,_|\__\__,_|
  / ___|| |_ _   _  __| (_) __|___/                        
  \___ \| __| | | |/ _` | |/ _ \                           
  ___) | |_| |_| | (_| | | (_) |                          
  |____/ \__|\__,_|\__,_|_|\___/                           
  "#);

  app_lib::run();
}
