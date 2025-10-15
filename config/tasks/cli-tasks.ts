import axios from "axios";
import { ExecuteCliParams, AxiosErrorResponse } from "../interfaces";

export function createExecuteCli() {
  return ({ managementApi, operation, address, ...args }: ExecuteCliParams) => {
    return axios
      .post(managementApi, {
        operation,
        address,
        ...args,
      })
      .then((response) => response.data as unknown)
      .catch((err: AxiosErrorResponse) => {
        console.log(err);
        throw new Error(err.response.data);
      });
  };
}
