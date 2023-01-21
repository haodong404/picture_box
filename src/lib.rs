use std::error::Error;
use std::io::Cursor;
use std::sync::{Arc, mpsc, Mutex};
use std::sync::mpsc::Sender;
use std::thread;
use bytes::Bytes;

use image::imageops::FilterType::Triangle;
use log::{error, info};

use crate::models::{Output, Partition, Resolve, Target, TargetFile, UploadInfo, ImageFormat};

pub mod models;
pub mod services;
pub mod storage;

#[cfg(test)]
mod tests;

fn exec(file_bytes: Arc<Bytes>, image_format: ImageFormat, output: Sender<Target>, key: String, cfg: Resolve) -> Result<(), Box<dyn Error>> {
    info!("RESOLVING: [{key}]");
    let file_reader = Cursor::new(&*file_bytes);
    let mut image = image::load(file_reader, image_format.image_format)?;
    if cfg.width.is_some() && cfg.height.is_some() {
        image = image.resize(cfg.width.unwrap(), cfg.width.unwrap(), Triangle);
    }
    let encoder = webp::Encoder::from_image(&image)?;
    let encoded = match cfg.lossy {
        Some(flag) => {
            if flag {
                encoder.encode(cfg.quality.unwrap_or(80f32))
            } else {
                encoder.encode_lossless()
            }
        }
        None => encoder.encode_lossless(),
    };
    info!("DONE: [{key}]");
    output.send(Target {
        resolve: key,
        file: TargetFile::Resolved(encoded),
    })?;
    Ok(())
}

pub fn compress(info: UploadInfo, config: &Partition) -> Result<Output, Box<dyn Error>> {
    let file_bytes = Arc::new(info.file);
    let mut output = Output {
        hash: info.hash,
        original_format: info.image_format,
        partition: info.partition,
        targets: vec![],
    };

    let original = config.original.as_ref();
    let original: &str = if let Some(s) = original {
        s
    } else {
        "original"
    };
    output.targets.push(Target {
        resolve: String::from(original),
        file: TargetFile::Original(Arc::clone(&file_bytes)),
    });
    if !config.enable {
        return Ok(output);
    }
    let mut handlers = vec![];
    let (tx, rx) = mpsc::channel();
    let err: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
    for item in config.resolves.iter() {
        let tx_clone = tx.clone();
        let val = Resolve {
            lossy: if item.1.lossy.is_some() {
                item.1.lossy
            } else {
                config.lossy
            },
            quality: if item.1.quality.is_some() {
                item.1.quality
            } else {
                config.quality
            },
            width: item.1.width,
            height: item.1.height,
        };
        let key = item.0.clone();
        let chunk = Arc::clone(&file_bytes);
        let format = output.original_format.clone();
        let err = Arc::clone(&err);
        let handle = thread::spawn(move || {
            exec(chunk, format, tx_clone, key, val).unwrap_or_else(|e| {
                let mut err = err.lock().unwrap();
                *err = Some(format!("{e:?}"));
                error!("{:?}", e);
            });
        });
        handlers.push(handle);
    }
    for handle in handlers {
        handle.join().unwrap();
    }
    let err = &*err.lock().unwrap();
    if err.is_some() {
        let err = err.as_ref().unwrap();
        return Err(String::from(err).into());
    }
    drop(tx);
    for i in rx {
        output.targets.push(i);
    }
    info!("ALL HAVE DONE {}", output.hash);
    Ok(output)
}

