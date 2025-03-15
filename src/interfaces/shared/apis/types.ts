/* eslint-disable @typescript-eslint/no-explicit-any */
import AllErrorTypes from "../errors";

export interface MessageProperty {
  message: string;
}

/**
 * Base para todas las respuestas de la API
 */
export interface ApiResponseBase extends MessageProperty {
  success: boolean;
}

export interface SuccessResponseAPIBase extends ApiResponseBase {
  success: true;
  message: string;
  data?: any;
}

export interface ErrorResponseAPIBase extends ApiResponseBase {
  message: string;
  success: false;
  details?: any;
  errorType?: AllErrorTypes;
}
