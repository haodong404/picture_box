import { checkPwd } from "../utils/useAuthorization";
import { getOrMock, post } from "./basic";
import { listPicturesOk, partitionsOk } from "./mocks";
import { ListResponse, Resolve } from "./models";

export function listPartitions() {
  const pwd = checkPwd();
  return getOrMock<Array<string>>(
    "/partitions",
    null,
    { data: partitionsOk, delay: 300 },
    {
      Password: pwd,
    }
  );
}

export function listPictures(param: { current: number; partition: string }) {
  const pwd = checkPwd();
  return getOrMock<ListResponse<Resolve>>(
    `/${param.partition}/list`,
    {
      current: param.current,
      page_size: 10,
    },
    {
      data: listPicturesOk(param.current),
      delay: 500,
    },
    {
      Password: pwd,
    }
  );
}

export function auth(password: string) {
  return getOrMock<boolean>(
    "/auth",
    null,
    {
      data: true,
      delay: 1000,
    },
    {
      Password: password,
    }
  );
}

export function upload(image: File, partition: string) {
  const param = new FormData();
  param.append("file", image, "new-image");
  return post<Resolve>(`/${partition}/upload`, null, param, Number.MAX_VALUE, {
    "Content-Type": "multipart/form-data",
  });
}