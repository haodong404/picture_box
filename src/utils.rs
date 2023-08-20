use image::DynamicImage;

use crate::models::{Config, PasswordHeader};

fn check_pwd(pwd: &str, config: &Config) -> bool {
    if let Some(p) = &config.password {
        p.ends_with(pwd)
    } else {
        true
    }
}

pub fn authorization(header: &PasswordHeader, config: &Config) -> Result<(), ()> {
    if check_pwd(&header.password, config) {
        Ok(())
    } else {
        Err(())
    }
}

/**
 * Attach the width and height of an image to the filename.
 */
pub fn attach_size(resolve: &str, image: &DynamicImage ) -> String {
    format!("{:x}-{:x}-{}", image.width(), image.height(), resolve)
}

/**
 * Get the width and height of an image from the filename.
 */
pub fn get_size(filename: &str) -> (u32, u32) {
    let mut parts = filename.split("-");

    let width = u32::from_str_radix(parts.next().unwrap_or("0"), 16).unwrap_or(0u32);
    let height = u32::from_str_radix(parts.next().unwrap_or("0"), 16).unwrap_or(0u32);

    (width, height)
}

/**
 * Get the real hash code from the filename.
 */
pub fn get_resolve<'a>(filename: &'a str) -> &'a str {
    let parts = filename.split("-");
    parts.last().unwrap_or("")
}