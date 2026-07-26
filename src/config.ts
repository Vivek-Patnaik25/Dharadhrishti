export const USE_MOCK = false;

// Live Catalyst Cloud API Gateway relative path in production for seamless same-origin deployment
export const BASE_URL = import.meta.env.PROD
  ? "/server/IO/execute"
  : "http://localhost:3000/server/dharadhristi_function";

export const APP_NAME = "DHARADRISHTI";
export const APP_SUBTITLE = "Karnataka Crime Intelligence Platform";
