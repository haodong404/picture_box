use std::fs::File;
use std::io::BufReader;
use crate::models::Config;

pub fn config() -> Config {
    let config_file = File::open("./resources/config.json").unwrap();
    serde_json::from_reader(BufReader::new(config_file)).unwrap()
}