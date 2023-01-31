import axios from "axios";
import { refresh } from "../utils/useAuthorization";
import { Mocker, QueryParams } from "./models";

const myAxios = axios.create({
  baseURL: "/api/pictures",
  timeout: 5000,
});

export function get<T>(
  path: string,
  query?: QueryParams,
  headers?: Record<string, string>
): Promise<T> {
  return new Promise((resolve, reject) => {
    myAxios({
      url: path,
      method: "get",
      params: query,
      headers,
    })
      .then((res) => {
        if (res.status == 403) {
          // Re-login
          refresh();
          return;
        }
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
  mock?: Mocker<T>,
  headers?: Record<string, string>
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
      get<T>(path, query, headers)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    }
  });
}
