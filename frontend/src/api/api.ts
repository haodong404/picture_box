import { getOrMock } from "./basic";
import { listPicturesOk, partitionsOk } from "./mocks";
import { ListResponse, Resolve } from "./models";

export function getPartitions() {
  return getOrMock<Array<string>>(partitionsOk, "/partitions");
}

export function listPictures(param: { current: number; partition: string }) {
  return getOrMock<ListResponse<Resolve>>(
    listPicturesOk(param.current),
    `/${param.partition}/list`,
    {
      current: param.current,
      page_size: 10,
    }
  );
}
