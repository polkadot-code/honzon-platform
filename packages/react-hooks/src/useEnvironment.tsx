import { useContext } from "react";
import { EnvironmentContext, EnvironmentData } from "./environment";

/**
 * @name useEnvironment
 * @description get environment context value
 * usage:
 *  const { api, connected, loading } = useEnvironment();
 */
export const useEnvironment = () => {
    return useContext<EnvironmentData>(EnvironmentContext);
};
