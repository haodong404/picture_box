# Picture box

[![Release](https://github.com/zacharychin233/picture_box/actions/workflows/release.yml/badge.svg?branch=master)](https://github.com/zacharychin233/picture_box/actions/workflows/release.yml)

#### A ***simple***, ***fast*** and ***easy*** web server for processing and storing images.

### 1. How to use

1. Download the binary file.
2. Provide a config file.
3. `picture_box -c config.json`

### 2. Configure

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
