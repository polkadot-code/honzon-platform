import { useContext } from "react";
import { EnvironmentContext, EnvironmentData } from "./environment";

/**
 * @name useApi
 * @description get api instance in environment context
 * usage:
 *  const api = useApi();
 */
export const useApi = () => {
    const data = useContext<EnvironmentData>(EnvironmentContext);
    return data.api;
};
