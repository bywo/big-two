import { promisify } from "es6-promisify";

export default function promisifyAll(obj: any) {
  for (const key in obj) {
    if (typeof obj[key] === "function") {
      obj[key + "Async"] = promisify(obj[key].bind(obj));
    }
  }
  return obj;
}
