import axios from "axios";
import { ExecuteCliParams, AxiosErrorResponse } from "../interfaces";
import { logger } from "../helpers";

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
        logger.error(err);
        throw new Error(err.response.data);
      });
  };
}
