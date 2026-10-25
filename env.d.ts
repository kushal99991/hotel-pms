interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MEDIA_API_URL: string;
  readonly VITE_MEDIA_API_KEY: string;
  readonly VITE_MEDIA_API_PATH: string;
  readonly VITE_PAYMENTS_API_PATH: string;
  readonly VITE_PAYMENTS_API_KEY: string;
  readonly VITE_MAPBOX_KEY: string;
  readonly VITE_PMS_DIR: string;
  readonly VITE_POS_DIR: string;
  readonly VITE_STRIPE_KEY: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_S3_REPORT_BUCKET_NAME: string;
  readonly VITE_SERVICE_SOCKET_API_URL: string;
  readonly VITE_SERVICE_NOTIFY_API_URL: string;
  readonly VITE_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
