import { useState } from "react";

import useSiasisAPIs from "./useSiasisAPIs";
import { SiasisAPIS } from "@/interfaces/shared/SiasisCompontes";
import { ApiResponseBase, SuccessResponseAPIBase } from "@/interfaces/shared/SiasisAPIs";

const useRequestAPIFeatures = (siasisAPI: SiasisAPIS) => {
  const [isSomethingLoading, setIsSomethingLoading] = useState(false);
  const [error, setError] = useState<ApiResponseBase | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<SuccessResponseAPIBase | null>(null);
  const { fetchSiasisAPI, fetchCancelables } = useSiasisAPIs(siasisAPI);

  return {
    fetchSiasisAPI,
    fetchCancelables,
    isSomethingLoading,
    setIsSomethingLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
  };
};

export default useRequestAPIFeatures;
