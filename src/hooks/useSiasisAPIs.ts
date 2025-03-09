import { useState, useCallback } from "react";

import { ObjetoConStringYNumber } from "@/interfaces/CustomObjects";
import { FetchCancelable } from "@/lib/utils/FetchCancellable";
import { MethodHTTP } from "@/interfaces/MethodsHTTP";
import { SiasisAPIS } from "@/interfaces/SiasisCompontes";
import getRandomAPI01IntanceURL from "@/lib/helpers/functions/getRandomAPI01InstanceURL";
import getRandomAPI02IntanceURL from "@/lib/helpers/functions/getRandomAPI02Instance";

const useSiasisAPIs = (siasisAPI: SiasisAPIS ) => {
  const urlAPI =
    siasisAPI == "API01" ? getRandomAPI01IntanceURL : getRandomAPI02IntanceURL;

  const [fetchCancelables, setFetchCancelables] = useState<FetchCancelable[]>(
    []
  );

  const fetchSiasisAPI = useCallback(
    (
      endpoint: string,
      method: MethodHTTP = "GET",
      queryParams: ObjetoConStringYNumber | null = null,
      body: BodyInit | string | null = null,
      JSONBody: boolean = true
    ) => {
      const headers: { ["Content-Type"]?: string } = {};

      if (JSONBody) {
        headers["Content-Type"] = "application/json";
      }

      const fetchCancelable = new FetchCancelable(
        `${urlAPI()}${endpoint}`,
        {
          method,
          headers,
          body,
        },
        queryParams as ObjetoConStringYNumber
      );

      setFetchCancelables((prev) => [...prev, fetchCancelable]);
      return fetchCancelable;
    },
    [urlAPI]
  );

  return { fetchSiasisAPI, fetchCancelables };
};

export default useSiasisAPIs;
