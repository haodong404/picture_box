import { ListResponse, Resolve } from "./models";
import m from "../statics/images/m.webp";
import origin from "../statics/images/origin.jpg";
import s from "../statics/images/s.webp";
import xs from "../statics/images/xs.webp";

export const partitionsOk = ["default", "avatar", "cover"];

const resolves: Resolve[] = [];

const length = 54;
for (let i = 0; i < length; i++) {
  resolves.push({
    middle: m,
    origin: origin,
    s: s,
    xs: xs,
  });
}

export const listPicturesOk = (current: number): ListResponse<Resolve> => {
  let list: Resolve[] = [];
  let end = current + 10;
  resolves.forEach((value, index) => {
    if (index >= current && index < end) {
      list.push(value);
    }
  });

  return {
    list: resolves,
    pagination: {
      current: current,
      page_size: 10,
      total: length,
    },
  };
};
