import { SuccessResponseAPIBase } from "@/interfaces/SiasisAPIs";
import React from "react";

const SuccessMessage1 = ({ message }: SuccessResponseAPIBase) => {
  return <span className="text-verde-principal">{message}</span>;
};

export default SuccessMessage1;
