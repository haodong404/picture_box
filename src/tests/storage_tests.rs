use std::fs;
use std::fs::File;
use std::io::{BufReader, Read};
use std::sync::Arc;
use bytes::Bytes;
use crate::models::{ImageFormat, Output, Target};
use crate::models::TargetFile::{Original, Resolved};
use crate::storage::{Local, Storage};
use crate::tests::common::config;

fn get_storage() -> Box<dyn Storage> {
    let dir = ".gen";
    let config = Box::new(config());
    let config = Box::leak(config);
    fs::remove_dir_all(dir).unwrap_or(());
    fs::create_dir_all(dir).expect("Cannot create dir");
    Box::new(Local::try_from_str(String::from(dir), config).unwrap())
}

#[test]
fn can_store_original_jpeg_pics() {
    let mut storage = get_storage();
    let config = config();
    let file = File::open("./resources/test.jpg").unwrap();
    let mut buffer = BufReader::new(file);
    let mut bytes: Vec<u8> = vec![];
    buffer.read_to_end(&mut bytes).unwrap();
    let bytes = Arc::new(Bytes::from(bytes));
    let resolve = String::from("small");
    let partition = String::from("default");
    let hash = String::from("can_remove_the_last_slash_of_base_url");
    let output = Output {
        partition: partition.clone(),
        hash: hash.clone(),
        original_format: ImageFormat::try_from(image::ImageFormat::Jpeg).unwrap(),
        targets: vec![Target {
            resolve: resolve.clone(),
            file: Original(bytes),
        }],
    };

    let result = storage.store(output).unwrap();
    assert_eq!(1, result.len());
    assert!(result.contains_key(&resolve));
    assert_eq!(Some(&format!("{}/api/pictures/{}/{}/{}", config.base_url, partition, resolve, hash)), result.get(&resolve));
}

#[test]
fn can_store_original_png_pics() {
    let mut storage = get_storage();
    let config = config();
    let file = File::open("./resources/test.png").unwrap();
    let mut buffer = BufReader::new(file);
    let mut bytes: Vec<u8> = vec![];
    buffer.read_to_end(&mut bytes).unwrap();
    let bytes = Arc::new(Bytes::from(bytes));
    let resolve = String::from("small");
    let partition = String::from("default");
    let hash = String::from("can_remove_the_last_slash_of_base_url");
    let output = Output {
        partition: partition.clone(),
        hash: hash.clone(),
        original_format: ImageFormat::try_from(image::ImageFormat::Png).unwrap(),
        targets: vec![Target {
            resolve: resolve.clone(),
            file: Original(bytes),
        }],
    };
    let result = storage.store(output).unwrap();
    assert_eq!(1, result.len());
    assert!(result.contains_key(&resolve));
    assert_eq!(Some(&format!("{}/api/pictures/{}/{}/{}", config.base_url, partition, resolve, hash)), result.get(&resolve));
}

#[test]
fn can_remove_the_last_slash_of_base_url() {
    let mut storage = get_storage();
    let mut config = config();
    config.base_url = String::from("http://localhost:8080/");
    let file = File::open("./resources/test.png").unwrap();
    let mut buffer = BufReader::new(file);
    let mut bytes: Vec<u8> = vec![];
    buffer.read_to_end(&mut bytes).unwrap();
    let bytes = Arc::new(Bytes::from(bytes));
    let resolve = String::from("small");
    let partition = String::from("default");
    let hash = String::from("can_remove_the_last_slash_of_base_url");
    let output = Output {
        partition: partition.clone(),
        hash: hash.clone(),
        original_format: ImageFormat::try_from(image::ImageFormat::Png).unwrap(),
        targets: vec![Target {
            resolve: resolve.clone(),
            file: Original(bytes),
        }],
    };

    let result = storage.store(output).unwrap();
    assert_eq!(1, result.len());
    assert!(result.contains_key(&resolve));
    assert_eq!(Some(&format!("{}api/pictures/{}/{}/{}", config.base_url, partition, resolve, hash)), result.get(&resolve));
}

#[test]
fn can_store_resolved_image() {
    let mut storage = get_storage();
    let mut config = config();
    config.base_url = String::from("http://localhost:8080/");
    let file = File::open("./resources/m.webp").unwrap();
    let mut buffer = BufReader::new(file);
    let mut bytes: Vec<u8> = vec![];
    buffer.read_to_end(&mut bytes).unwrap();
    let bytes = Arc::new(Bytes::from(bytes));
    let resolve = String::from("middle");
    let partition = String::from("default");
    let hash = String::from("can_store_resolved_image");
    let webp_image = webp::Decoder::new(&bytes);
    let webp_image = webp_image.decode().unwrap();
    let webp_image = webp_image.to_image();
    let encoder = webp::Encoder::from_image(&webp_image).unwrap();
    let output = Output {
        partition: partition.clone(),
        hash: hash.clone(),
        original_format: ImageFormat::try_from(image::ImageFormat::WebP).unwrap(),
        targets: vec![Target {
            resolve: resolve.clone(),
            file: Resolved(encoder.encode_lossless()),
        }],
    };

    let result = storage.store(output).unwrap();
    assert_eq!(1, result.len());
    assert!(result.contains_key(&resolve));
    assert_eq!(Some(&format!("{}api/pictures/{}/{}/{}", config.base_url, partition, resolve, hash)), result.get(&resolve));
}

#[test]
fn can_store_more_than_two_pictures() {
    let mut storage = get_storage();
    let mut config = config();
    config.base_url = String::from("http://localhost:8080/");
    let file = File::open("./resources/m.webp").unwrap();
    let mut buffer = BufReader::new(file);
    let mut bytes: Vec<u8> = vec![];
    buffer.read_to_end(&mut bytes).unwrap();

    let file = File::open("./resources/test.jpg").unwrap();
    let mut buffer = BufReader::new(file);
    let mut bytes_origin: Vec<u8> = vec![];
    buffer.read_to_end(&mut bytes_origin).unwrap();

    let bytes = Arc::new(Bytes::from(bytes));
    let resolve = String::from("middle");
    let partition = String::from("default");
    let hash = String::from("can_store_more_than_two_pictures");
    let webp_image = webp::Decoder::new(&bytes);
    let webp_image = webp_image.decode().unwrap();
    let webp_image = webp_image.to_image();
    let encoder = webp::Encoder::from_image(&webp_image).unwrap();
    let output = Output {
        partition: partition.clone(),
        hash: hash.clone(),
        original_format: ImageFormat::try_from(image::ImageFormat::WebP).unwrap(),
        targets: vec![Target {
            resolve: resolve.clone(),
            file: Resolved(encoder.encode_lossless()),
        }, Target {
            resolve: String::from("origin"),
            file: Original(Arc::new(Bytes::from(bytes_origin))),
        }],
    };

    let result = storage.store(output).unwrap();
    assert_eq!(2, result.len());
    assert!(result.contains_key(&resolve));
    assert!(result.contains_key("origin"));
    assert_eq!(
        Some(&format!("{}api/pictures/{}/{}/{}", &config.base_url, partition, resolve, hash)
        ), result.get(&resolve));
    assert_eq!(
        Some(&format!("{}api/pictures/{}/{}/{}", config.base_url, partition, "origin", hash)
        ), result.get("origin"));
}