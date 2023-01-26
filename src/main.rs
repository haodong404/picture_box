extern crate core;

use actix_web::web::Data;
use actix_web::{middleware::Logger, web, App, HttpServer, HttpResponse};
use clap::Parser;
use env_logger::Env;
use log::info;
use picture_box::models::{Args, Config, Context};
use picture_box::services::{delete_picture, get_picture, list_pictures, upload_picture, list_partitions};
use picture_box::storage::{Cos, Local, Storage};
use std::fs::File;
use std::io::{BufReader, Result};
use std::sync::{Arc, Mutex};
use actix_embed::Embed;
use actix_web::http::header::CONTENT_TYPE;
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "./frontend/dist"]
struct Assets;

#[actix_web::main]
async fn main() -> Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("debug"));
    let args = Args::parse();
    let config_file = File::open(&args.config).expect("Cannot find the configuration file.");
    let config: Config = serde_json::from_reader(BufReader::new(config_file))
        .expect("The configuration file must be in JSON format.");
    let config = Box::new(config);
    let config = Box::leak(config);
    if let Some(bind) = args.bind {
        config.bind = bind;
    }
    if let Some(port) = args.port {
        config.port = port;
    }
    let storage: Box<Mutex<dyn Storage + Send + Sync>> = match config.storage.as_ref() {
        "local" => {
            let local = &config.local.as_ref().expect("local is required").dir;
            let str = String::from(local);
            let local = Local::try_from_str(str, config).unwrap();
            Box::new(Mutex::new(local))
        }
        "cos" => Box::new(Mutex::new(Cos {})),
        _ => {
            panic!("Cannot find storage: {}", config.storage);
        }
    };
    let context = Arc::new(Context { config, storage });
    info!(
        "Server is running at: {}:{}",
        config.bind.as_str(),
        config.port
    );

    HttpServer::new(move || {
        let context = Arc::clone(&context);
        App::new()
            .app_data(Data::from(context))
            .wrap(Logger::default())
            .service(
                web::scope("/api/pictures")
                    .service(upload_picture)
                    .service(get_picture)
                    .service(delete_picture)
                    .service(list_pictures)
                    .service(list_partitions),
            )
            .service(
                Embed::new("/{tail:.*}", &Assets)
                    .index_file("index.html")
                    .fallback_handler(|_: &_| -> HttpResponse {
                        let index = Assets::get("index.html").unwrap();
                        let index_data = index.data.into_owned();
                        HttpResponse::Ok()
                            .append_header((CONTENT_TYPE, "text/html"))
                            .body(index_data)
                    }),
            )
    })
        .bind((config.bind.as_str(), config.port))?
        .run()
        .await
}
