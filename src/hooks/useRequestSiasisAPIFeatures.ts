import { useState } from "react";

import useSiasisAPIs from "./useSiasisAPIs";

import {
  ErrorResponseAPIBase,
  MessageProperty,
} from "@/interfaces/shared/apis/types";
import { SiasisAPIS } from "@/interfaces/shared/SiasisComponents";

const useRequestAPIFeatures = (siasisAPI: SiasisAPIS) => {
  const [isSomethingLoading, setIsSomethingLoading] = useState(false);
  const [error, setError] = useState<ErrorResponseAPIBase | null>(null);
  const [successMessage, setSuccessMessage] = useState<MessageProperty | null>(
    null
  );
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
