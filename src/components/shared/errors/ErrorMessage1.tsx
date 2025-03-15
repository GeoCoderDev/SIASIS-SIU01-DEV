import { ErrorResponseAPIBase } from "@/interfaces/shared/apis/types";
import React from "react";

const ErrorMessage1 = ({ message }: ErrorResponseAPIBase) => {
  return <span className="text-rojo-oscuro">{message}</span>;
};

export default ErrorMessage1;
