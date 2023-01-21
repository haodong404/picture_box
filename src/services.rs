use actix_multipart::Multipart;
use actix_web::{delete, get, HttpResponse, post, web};
use actix_web::http::header::{CONTENT_LENGTH, CONTENT_TYPE};
use bytes::{BufMut, BytesMut};
use futures_util::stream::StreamExt as _;
use imageinfo::ImageInfo;
use log::error;
use crate::compress;
use crate::models::{Context, ListQueryParams, response_err, response_err_400, response_err_400_message, response_err_404_empty, response_err_500, response_ok_data, response_ok_message, UploadInfo};

/// Upload a image file to the server, a partition in the config file is required.
/// The format of a request body is multipart/form-data, There are 3 items as follows:
///     `file: File`    **(Required):**    A image file;
///     `name: String`  **(Optional):**    The file name, it can be empty;
///     `hash: String`  **(Optional):**    The file hash, the server will hash the image if it's null;
#[post("/{partition}/upload")]
pub async fn upload_picture(path: web::Path<(String, )>, mut payload: Multipart, data: web::Data<Context>) -> HttpResponse {
    let mut file_bytes = BytesMut::with_capacity(10 * 1024 * 1024);
    let mut name_bytes = BytesMut::new();
    let mut hash_bytes = BytesMut::new();
    let mut hash: Option<String> = None;
    // iterate over multipart stream
    while let Some(item) = payload.next().await {
        if item.is_err() {
            return response_err_400();
        }
        let mut field = item.unwrap();
        // Field in turn is stream of *Bytes* object
        while let Some(chunk) = field.next().await {
            if chunk.is_err() {
                return response_err_400();
            }
            let chunk_checked = chunk.unwrap();
            match field.name() {
                "name" => {
                    name_bytes.put(chunk_checked);
                }
                "file" => {
                    file_bytes.put(chunk_checked);
                }
                "hash" => {
                    hash_bytes.put(chunk_checked);
                }
                _ => {}
            }
        }
    }

    // Compute hash
    if hash_bytes.is_empty() {
        hash = Some(format!("{:?}", md5::compute(&file_bytes)));
    }

    let data = data.into_inner();
    let config = data.config;
    let storage = data.storage.lock();
    if storage.is_err() {
        return response_err_500("Server error");
    }
    let mut storage = storage.unwrap();
    let partition_str = path.into_inner().0;
    let partition = config.partitions.get(&partition_str);
    if partition.is_none() {
        return response_err_400_message(&format!("Partition {partition_str} not found"));
    }
    let partition = partition.unwrap();

    // Return data directly if the input image already exists.
    if let Some(result) = storage.exists(&partition_str, hash.as_ref().unwrap()) {
        return response_ok_data(result);
    }

    // Obtain image info.
    let mut _image_format: Option<crate::models::ImageFormat> = None;
    if let Ok(image_info) = ImageInfo::from_raw_data(&file_bytes) {
        let mime = image_info.mimetype;
        if let Ok(format) = crate::models::ImageFormat::try_from(image_info) {
            _image_format = Some(format);
        } else {
            return response_err_400_message(&format!("Unsupported format: {}", mime));
        }
    } else {
        return response_err_400_message("Unknown image format.");
    }

    let info = UploadInfo {
        name: String::from(String::from_utf8_lossy(&name_bytes)),
        file: file_bytes.freeze(),
        image_format: _image_format.unwrap(),
        hash: hash.unwrap(),
        partition: partition_str,
    };

    // Start compressing.
    let result = compress(info, partition);
    if result.is_err() {
        return response_err_500(&format!("{:?}", result.err()));
    }
    let output = result.unwrap();
    let local_config = &config.local;
    if local_config.is_none() {
        return response_err_500("The local's config is required.");
    }
    let store_result = storage.store(output);
    if store_result.is_err() {
        let msg = store_result.err().unwrap();
        return response_err_500(&*msg.to_string());
    }
    response_ok_data(store_result.unwrap())
}

/// Find a picture.
#[get("/{partition}/{resolve}/{id}")]
pub async fn get_picture(path: web::Path<(String, String, String)>, data: web::Data<Context>) -> HttpResponse {
    let (partition_str, resolve, id) = path.into_inner();
    let data = data.into_inner();
    let config = data.config;
    let storage = data.storage.lock();
    if storage.is_err() {
        return response_err_500("Server error");
    }
    let storage = storage.unwrap();
    let partition = config.partitions.get(&partition_str);
    if partition.is_none() {
        return response_err_404_empty();
    }
    let result = storage.find(&partition_str, &id, &resolve);
    match result {
        Ok(result) => {
            let (bytes, mime) = result;
            return HttpResponse::Ok()
                .append_header((CONTENT_TYPE, mime))
                .append_header((CONTENT_LENGTH, bytes.len()))
                .body(bytes);
        }
        Err(e) => {
            error!("{e:?}");
            response_err_404_empty()
        }
    }
}

/// Delete a picture.
#[delete("/{partition}/{id}")]
pub async fn delete_picture(path: web::Path<(String, String)>, data: web::Data<Context>) -> HttpResponse {
    let (partition_str, id) = path.into_inner();
    let data = data.into_inner();
    let config = data.config;
    let storage = data.storage.lock();
    if storage.is_err() {
        return response_err_500("Server error");
    }
    let mut storage = storage.unwrap();
    let partition = config.partitions.get(&partition_str);
    if partition.is_none() {
        return response_err_404_empty();
    }
    let result = storage.delete(&partition_str, &id);
    if let Err(e) = result {
        return response_err_500(e.as_str());
    }
    response_ok_message(&format!("{}/{} has been deleted.", partition_str, id))
}

/// List all pictures, there are 2 query parameters available:
///     `current: usize`     **(Required):**   The current page, start from 1.
///     `page_size: usize`   **(Required):**   How many items you need at a time.
#[get("/{partition}/list")]
pub async fn list_pictures(path: web::Path<(String, )>, params: web::Query<ListQueryParams>, data: web::Data<Context>) -> HttpResponse {
    let (partition_str, ) = path.into_inner();
    if !data.config.partitions.contains_key(partition_str.as_str()) {
        return response_err(&format!("Partition {} not found", &partition_str), 404, 404);
    }
    let storage = data.storage.lock();
    if storage.is_err() {
        return response_err_500("Server error");
    }
    let storage = storage.unwrap();
    match storage.list(params.current, params.page_size, &partition_str) {
        Ok(result) => response_ok_data(result),
        Err(e) => response_ok_message(&e.to_string())
    }
}