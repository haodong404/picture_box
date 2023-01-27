import axios from "axios";
import { QueryParams } from "./models";

const myAxios = axios.create({
  baseURL: "/api/pictures",
  timeout: 5000,
});

export function get<T>(path: string, query?: QueryParams): Promise<T> {
  return new Promise((resolve, reject) => {
    myAxios({
      url: path,
      method: "get",
      params: query,
    })
      .then((res) => {
        const data = (res.data as any).data;
        resolve(data);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export function getOrMock<T>(
  mock: T | undefined,
  path: string,
  query?: QueryParams
) {
  if (import.meta.env.DEV && MOCK) {
    if (mock) {
      return Promise.resolve(mock);
    } else {
      return Promise.reject("Not found");
    }
  } else {
    return get<T>(path, query);
  }
}
