# Picture ox

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

## API

All the following apis are **prefixed with** `/api/picture`.

| URL                        | Method | Note                            | Example              |
| -------------------------- | ------ | ------------------------------- | -------------------- |
| `/:partition/upload`       | POST   | Upload an image file.           | /default/upload      |
| `/:partition/:resolve/:id` | GET    | Find an image file.             | /default/xs/hashcode |
| `/:partition/:id`          | DELETE | Delete all images in a resolve. | /default/hashcode    |
| `/:partition/list`         | GET    | List all images in a partition  | /default/list        |

## Configure

The json structure as follows:

```typescript
interface Local {
    // Root directory.
    dir: string
}

// A processing resolve.
// Each resolve is a image, and it will be converted to a webp.
interface Resolve {
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
    // The original file's tag name.
    original: string | undefined, // Default: origin
    // Does it need lossy compression. It has a lower priority.
    // It would be overrided by Resolve.lossy.
    lossy: boolean
    // Quality of webp file. available if lossy is true. It has a lower priority.
    // It would be overrided by Resolve.lossy.
    quality: number | undefined, // Default: 80.0, range: (0, 100)
    // You can create many resolves, but more resolves mean more processing time. 
    // Key: resolve name
    resolves: Record<string, Resolve>,
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
