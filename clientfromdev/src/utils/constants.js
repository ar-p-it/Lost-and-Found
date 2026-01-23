const isLocal = location.hostname === "localhost";
export const BASE_URL = isLocal ? "http://localhost:7777" : "";
