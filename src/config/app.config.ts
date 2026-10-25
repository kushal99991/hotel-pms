import Cookies from "js-cookie";

export interface AppConfig {
  baseUrl: string;
  mediaAPI: string;
  mediaAPIKey: string;
  mediaPath: string;
  paymentsAPI: string;
  paymentsAPIKey: string;
  stripeKey: string;
  appName: string;
  socketUrl: string;
  pmsDir: string;
  posDir: string;
  mapBoxToken: string;
  tokenName: string;
  dateApiTimeOfDayFormat: string;
  dateApiFormat: string;
  dateTimeApiFormat: string;
  dateTimeOfDayFormat: string;
  dateTimeWithTZFormat: string;
  displayDateFormat: string;
  datePickerDateFormat: string;
  displayDateWithTimeFormat: string;
  dateDayMonth: string;
  dateMonthDayYear: string;
  domainName: string;
  version: string;
  s3ReportBucketName: string;
  serviceSocketApiUrl: string;
  serviceNotifyApiUrl: string;
  setLocal: (key: string, value: any) => void;
  getLocal: (key: string) => any;
  setCookie: (key: string, value: any) => void;
  getCookie: (key: string) => any;
  getMediaKey: (
    oid: string | number,
    pk: string | number | null,
    suffix: string
  ) => string;
  getTenantFromUrl: () => string;
}

export const getEnv = (key: string, fallback: string): string => {
  return import.meta.env?.[key] ?? fallback;
};

export const appConfig: AppConfig = {
  baseUrl: getEnv("VITE_API_URL", "http://localhost:50000"),
  mediaAPI: getEnv("VITE_MEDIA_API_URL", "http://localhost:5003/local/media"),
  mediaAPIKey: getEnv("VITE_MEDIA_API_KEY", ""),
  mediaPath: getEnv(
    "VITE_MEDIA_API_PATH",
    "https://uw2-de-example-assets.s3.amazonaws.com"
  ),
  paymentsAPI: getEnv("VITE_PAYMENTS_API_PATH", "http://localhost:5003/local"),
  paymentsAPIKey: getEnv("VITE_PAYMENTS_API_KEY", ""),
  stripeKey: getEnv("VITE_STRIPE_KEY", ""),
  appName: "PMS",
  pmsDir: getEnv("VITE_PMS_DIR", "booking-engine"),
  posDir: getEnv("VITE_POS_DIR", "pos"),
  mapBoxToken: getEnv("VITE_MAPBOX_KEY", ""),
  tokenName: "auth",
  dateApiTimeOfDayFormat: "HH:mm:ss",
  dateApiFormat: "YYYY-MM-DD",
  dateTimeApiFormat: "YYYY-MM-DDTHH:mm:ss",
  dateTimeWithTZFormat: "YYYY-MM-DDTHH:mm:ssZ",
  dateTimeOfDayFormat: "h:mm A",
  datePickerDateFormat: "MM/dd/yyyy",
  displayDateFormat: "MM/DD/YYYY",
  displayDateWithTimeFormat: "MM/DD/YYYY HH:mm A",
  dateDayMonth: "ddd, MMM D",
  dateMonthDayYear: "MMM DD, YYYY",
  domainName: "domain",
  version: getEnv("VITE_VERSION", "local"),
  socketUrl: getEnv(
    "VITE_SOCKET_URL",
    "wss://development-service-sockets.example.net"
  ),
  s3ReportBucketName: getEnv(
    "VITE_S3_REPORT_BUCKET_NAME",
    "example-pms-development-reports"
  ),
  serviceSocketApiUrl: getEnv(
    "VITE_SERVICE_SOCKET_API_URL",
    "https://development-service-sockets.example.net"
  ),
  serviceNotifyApiUrl: getEnv(
    "VITE_SERVICE_NOTIFY_API_URL",
    "http://localhost:5000/local"
  ),

  setLocal: (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  getLocal: (key: string) => localStorage.getItem(key),

  setCookie: (key: string, value: string) => {
    Cookies.set(key, value);
  },
  getCookie: (key: string) => Cookies.get(key),

  getTenantFromUrl: () => {
    const hostname = window.location.hostname;
    const cloudMatch = hostname.match(/^([^.]+)\.example\.cloud$/);
    if (cloudMatch) return cloudMatch[1];

    const netMatch = hostname.match(
      /^(?:development|test)-([^.]+)\.example\.net$/
    );
    if (netMatch) return netMatch[1];

    return "";
  },

  getMediaKey: (oid, pk, suffix = "") => {
    let key = `${appConfig.getCookie("domain") || "default"}/media/${oid}/`;
    if (pk) key += `${pk}/`;
    return `${key}${suffix}`;
  },
};
