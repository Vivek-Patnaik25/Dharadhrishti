export const USE_MOCK = false;

// Dynamically use live Catalyst Cloud API Gateway in production and local server in development
export const BASE_URL = import.meta.env.PROD
  ? "https://dharadhristi-60079561238.development.catalystserverless.in/server/IO/execute"
  : "http://localhost:3000/server/dharadhristi_function";

export const APP_NAME = "DHARADRISHTI";
export const APP_SUBTITLE = "Karnataka Crime Intelligence Platform";
