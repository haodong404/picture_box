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
