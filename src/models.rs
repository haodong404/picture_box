use crate::storage::Storage;
use actix_web::error::ParseError;
use actix_web::http::header::{
    ContentType, Header, HeaderName, HeaderValue, InvalidHeaderValue, TryIntoHeaderValue,
    CONTENT_TYPE,
};
use actix_web::http::StatusCode;
use actix_web::{HttpResponse, HttpResponseBuilder};
use bytes::Bytes;
use clap::Parser;
use imageinfo::ImageInfo;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::string::ToString;
use std::sync::{Arc, Mutex};
use webp::WebPMemory;

fn default_hostname() -> String {
    "localhost".to_string()
}

fn default_port() -> u16 {
    7709
}

/// To process an image.
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    /// The path of configuration, a JSON file
    #[arg(short, long)]
    pub config: String,

    /// Bind a hostname.
    #[arg(short, long)]
    pub bind: Option<String>,

    /// Server port.
    #[arg(short, long)]
    pub port: Option<u16>,
}

impl Clone for Args {
    fn clone(&self) -> Self {
        Args {
            config: self.config.clone(),
            bind: self.bind.clone(),
            port: self.port.clone(),
        }
    }

    fn clone_from(&mut self, source: &Self) {
        *self = source.clone()
    }
}

/// The is a data needs to be shared with all services.
pub struct Context {
    pub config: &'static Config,
    pub storage: Box<Mutex<dyn Storage + Sync + Send>>,
}

#[derive(Deserialize)]
pub struct Resolve {
    pub(crate) width: Option<u32>,
    pub(crate) height: Option<u32>,
    pub(crate) lossy: Option<bool>,
    pub(crate) quality: Option<f32>,
}

fn default_base_url() -> String {
    "http://localhost:8080".to_string()
}

#[derive(Deserialize)]
pub struct Config {
    pub storage: String,
    pub local: Option<LocalConfig>,

    #[serde(default = "default_hostname")]
    pub bind: String,

    #[serde(default = "default_port")]
    pub port: u16,
    #[serde(default = "default_base_url")]
    pub base_url: String,

    pub password: Option<String>,

    pub partitions: HashMap<String, Partition>,
}

#[derive(Deserialize)]
pub struct LocalConfig {
    pub dir: String,
}

#[derive(Deserialize)]
pub struct Partition {
    pub(crate) enable: bool,
    pub(crate) lossy: Option<bool>,
    pub(crate) quality: Option<f32>,
    pub(crate) resolves: HashMap<String, Resolve>,
}

#[derive(Debug)]
pub struct Output {
    pub partition: String,
    pub hash: String,
    pub original_format: ImageFormat,
    pub targets: Vec<Target>,
}

#[derive(Debug)]
pub enum TargetFile {
    Resolved(WebPMemory),
    Original(Arc<Bytes>),
}

impl TargetFile {
    pub fn is_original(&self) -> bool {
        matches!(*self, TargetFile::Original(_))
    }
}

#[derive(Debug)]
pub struct Target {
    pub resolve: String,
    pub file: TargetFile,
}

unsafe impl Send for Target {}

#[derive(Debug)]
pub struct UploadInfo {
    pub name: String,
    pub file: Bytes,
    pub image_format: ImageFormat,
    pub hash: String,
    pub partition: String,
}

#[derive(Serialize, Deserialize)]
pub struct Success<T: Serialize> {
    pub code: u16,
    pub message: String,
    pub data: Option<T>,
}

#[derive(Serialize, Deserialize)]
pub struct PageList<T: Serialize> {
    pub list: Vec<T>,
    pub pagination: Pagination,
}

#[derive(Serialize, Deserialize)]
pub struct Pagination {
    pub current: usize,
    pub total: usize,
    pub page_size: usize,
}

#[derive(Serialize, Deserialize)]
pub struct Failure {
    pub code: u16,
    pub error: String,
}

#[derive(Serialize, Deserialize)]
pub struct Picture {
    id: String,
    url: String,
}

#[derive(Clone, Debug)]
pub struct ImageFormat {
    pub image_format: image::ImageFormat,
    pub ext: String,
    pub mime_type: String,
}

impl TryFrom<ImageInfo> for ImageFormat {
    type Error = String;

    fn try_from(value: ImageInfo) -> Result<Self, Self::Error> {
        let format =
            image::ImageFormat::from_mime_type(value.mimetype).ok_or("Unsupported format")?;
        Ok(ImageFormat {
            image_format: format,
            ext: value.ext.to_string(),
            mime_type: value.mimetype.to_string(),
        })
    }
}

#[derive(Deserialize)]
pub struct ListQueryParams {
    pub current: usize,
    pub page_size: usize,
}

pub struct PasswordHeader {
    pub password: String,
}

impl From<&str> for PasswordHeader {
    fn from(pwd: &str) -> Self {
        PasswordHeader {
            password: pwd.to_string(),
        }
    }
}

impl TryIntoHeaderValue for PasswordHeader {
    type Error = InvalidHeaderValue;

    fn try_into_value(self) -> Result<actix_web::http::header::HeaderValue, Self::Error> {
        HeaderValue::from_str(&self.password)
    }
}

impl Header for PasswordHeader {
    fn name() -> actix_web::http::header::HeaderName {
        HeaderName::from_static("password")
    }

    fn parse<M: actix_web::HttpMessage>(msg: &M) -> Result<Self, actix_web::error::ParseError> {
        let password = msg.headers().get("Password").ok_or(ParseError::Header)?;
        Ok(PasswordHeader::from(
            password.to_str().map_err(|_| ParseError::Header)?,
        ))
    }
}

fn extension2mime(extension: &str) -> Result<&str, &str> {
    match extension {
        "png" => Ok("image/png"),
        "jpeg" | "jpg" => Ok("image/jpeg"),
        "webp" => Ok("image/webp"),
        _ => Err("Unknown format"),
    }
}

impl TryFrom<image::ImageFormat> for ImageFormat {
    type Error = String;

    fn try_from(value: image::ImageFormat) -> Result<Self, Self::Error> {
        let ext = value.extensions_str()[0];
        let mime = extension2mime(ext)?;
        Ok(ImageFormat {
            image_format: value,
            ext: ext.to_string(),
            mime_type: mime.to_string(),
        })
    }
}

pub fn response_err(message: &str, code: u16, status: u16) -> HttpResponse {
    let status_code = StatusCode::from_u16(status).unwrap_or(StatusCode::SERVICE_UNAVAILABLE);
    let mut response = HttpResponseBuilder::new(status_code);
    response.append_header((CONTENT_TYPE, ContentType::json()));
    let err = Failure {
        code,
        error: String::from(message),
    };
    response.json(err)
}

pub fn response_err_400_message(message: &str) -> HttpResponse {
    response_err(message, 400, 400)
}

pub fn response_err_404_empty() -> HttpResponse {
    HttpResponse::NotFound().finish()
}

pub fn response_err_400() -> HttpResponse {
    response_err_400_message("Bad Request")
}

pub fn response_err_500(message: &str) -> HttpResponse {
    response_err(message, 500, 500)
}

pub fn response_err_403() -> HttpResponse {
    response_err("Authorization failed.", 403, 403)
}

pub fn response_ok<T: Serialize>(
    data: Option<T>,
    message: &str,
    code: u16,
    status: u16,
) -> HttpResponse {
    let mut response = HttpResponse::Ok();
    response.append_header((CONTENT_TYPE, ContentType::json()));
    let status_code = StatusCode::from_u16(status);
    if status_code.is_err() {
        return response_err("Unknown status code is provided.", 500, 500);
    }
    let ok = Success {
        code,
        data,
        message: String::from(message),
    };
    let json = serde_json::to_string(&ok).unwrap_or_else(|e| {
        response.status(StatusCode::SERVICE_UNAVAILABLE);
        format!("{{code: 99, message: '{e:?}'}}")
    });
    response.status(status_code.unwrap());
    response.body(json)
}

pub fn response_ok_data<T: Serialize>(data: T) -> HttpResponse {
    response_ok(Some(data), "Success", 200, 200)
}

pub fn response_ok_message(message: &str) -> HttpResponse {
    response_ok::<String>(None, message, 200, 200)
}

pub fn response_ok_empty() -> HttpResponse {
    response_ok::<Failure>(None, "Success", 200, 200)
}
