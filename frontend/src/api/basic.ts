import axios from "axios";
import { Mocker, QueryParams } from "./models";

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
  path: string,
  query?: QueryParams,
  mock?: Mocker<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (import.meta.env.DEV && MOCK) {
      setTimeout(() => {
        if (mock) {
          resolve(mock.data);
        } else {
          reject("Not found");
        }
      }, mock?.delay | 0);
    } else {
      get<T>(path, query)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    }
  });
}
