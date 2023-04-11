# Picture Box

[![Test](https://github.com/zacharychin233/picture_box/actions/workflows/ci.yml/badge.svg)](https://github.com/zacharychin233/picture_box/actions/workflows/ci.yml)

#### A ***simple***, ***fast*** and ***easy*** web server for processing and storing images.

When you upload an image file, the application will process it according to your configuration. It only supports converting some specific images formats to webp files.

##### Supported image format:

* PNG
* JPEG
* GIF
* TIFF
* WebP
* AVIF

## How to use

1. [Download](https://github.com/zacharychin233/picture_box/releases) the release file.

2. Extract and move it to a new directory, a bunch of files may be generated here.

3. Write a config file.

4. And start `picture_box -c config.json`

## Command

- `--config, -c`;  **REQUIRED**;   A config file, JSON format.

- `--bind, -b`;  Optional;  A hostname, it will override the 'bind' field in config file.

- `--port, -p`;  Optional;  it will override 'port' config file.

## API

All the following apis are **prefixed with** `/api/pictures`.

| URL                       | Method | Request                                                                     | Note                                                   | Example              |
| ------------------------- | ------ | --------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------- |
| `/:partition/upload`      | POST   | `multipart/form-data`<br/>file: File,<br/>[name: string]<br/>[hash: string] | Upload an image file.                                  | /default/upload      |
| `/:partition/:scheme/:id` | GET    | None                                                                        | Find an image file.                                    | /default/xs/hashcode |
| `/:partition/:id`         | DELETE | None                                                                        | Delete all images in a scheme.                         | /default/hashcode    |
| `/:partition/list`        | GET    | A password header.<br/>`Password: <password>`                               | List all images in a partition                         | /default/list        |
| `/partitions`             | GET    | A password header.<br/>`Password: <password>`                               | List all partitions, it depends on your configuration. |                      |
| `/auth`                   | GET    | A password header.<br/>`Password: <password>`                               | Verify the password                                    |                      |

## Configure

The json structure as follows ([Template](https://github.com/zacharychin233/picture_box/blob/master/resources/config.json)) :

```typescript
interface Local {
    // Root directory.
    dir: string
}
// A processing scheme.
// Each scheme is a image, and it will be converted to a webp.
interface Scheme {
    // width
    widht: number | undefined,
    // height
    height: number | undefined,
    // Does it need lossy compression, it has a higher priority.
    // It would override Partition.lossy.
    lossy: number | undefined,
    // Quality of webp file. available if lossy is true. It has a higher priority.
    // It would overrid Partition.lossy.
    quality: number | undefined,
}
interface Partition {
    // Does it need to be compressed
    enable: boolean,
    // Does it need lossy compression. It has a lower priority.
    // It would be overrided by Resolve.lossy.
    lossy: boolean,
    // Which picture in a scheme should be the Frontend thumbnail.
    // It must be one of the value in a Scheme.
    thumbnail: string, // Optional, 
    // Quality of webp file. available if lossy is true. It has a lower priority.
    // It would be overrided by Resolve.lossy.
    quality: number | undefined, // Default: 80.0, range: (0, 100)
    // You can create many schemes, but more schemes mean more processing time. 
    // Key: scheme name
    schemes: Record<string, Scheme>,
}
interface Config {
    // Bind hostname
    bind: String | undefined, // Default: 8080
    // Port
    port: number | undefined, // Default: localhost
    // Where you wanna store.
    storage: string,
    // local config.
    local: Local | undefined, // Required when storage is 'local'.
    // When you uploaded a image, base_url is a prefix of the generated link.
    base_url: string | undefined, // Default: http://localhost:80080
    // You can create many partitions, each partition have it's owne configure.
    // The key of this record is a name.
    partitions: Record<string, Partition>
}
```

## License

[MIT](https://github.com/zacharychin233/codroid-textmate/blob/master/LICENSE)