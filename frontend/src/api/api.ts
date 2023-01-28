import { getOrMock } from "./basic";
import { listPicturesOk, partitionsOk } from "./mocks";
import { ListResponse, Resolve } from "./models";

export function getPartitions() {
  return getOrMock<Array<string>>("/partitions", null, { data: partitionsOk, delay: 500 });
}

export function listPictures(param: { current: number; partition: string }) {
  return getOrMock<ListResponse<Resolve>>(
    `/${param.partition}/list`,
    {
      current: param.current,
      page_size: 10,
    },
    {
      data: listPicturesOk(param.current),
      delay: 500,
    }
  );
}
