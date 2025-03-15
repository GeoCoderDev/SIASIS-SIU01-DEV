import { MessageProperty } from "@/interfaces/shared/apis/types";
import React from "react";

const SuccessMessage1 = ({ message }: MessageProperty) => {
  return <span className="text-verde-principal">{message}</span>;
};

export default SuccessMessage1;
