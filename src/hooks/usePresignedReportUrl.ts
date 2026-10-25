import { useCallback, useState } from "react";
import axios from "axios";
import { appConfig } from "config/app.config";

export interface PresignedParams {
  propertyId: number;
  date: Date;
  type: string;
  fileName: string;
  url?: string;
}

export const usePresignedFileUrl = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUrl = useCallback(
    async ({
      propertyId,
      date,
      type,
      fileName,
      url, // optional: allow caller to override endpoint
    }: PresignedParams) => {
      setLoading(true);
      setError(null);

      try {
        /* ── 1. Build query params ─────────────────────────────── */
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // JS months are 0‑based
        const day = date.getDate();

        const tenant = appConfig.getCookie(appConfig.tokenName) || "default";
        const params = {
          bucket: appConfig.s3ReportBucketName,
          tenant,
          property_id: propertyId,
          year,
          month,
          day,
          type,
          fileName,
        };

        /* ── 2. Choose the endpoint ────────────────────────────── */
        const endpoint =
          url ?? `${appConfig.paymentsAPI}/reports/night/audit/list`;

        /* ── 3. Make the request ───────────────────────────────── */
        const token = appConfig.getCookie(appConfig.tokenName);

        const res = await axios.get(endpoint, {
          params,
          headers: {
            "x-api-key": appConfig.mediaAPIKey,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        /* ── 4. Extract the file URL ───────────────────────────── */
        const files: string[] | undefined = res.data?.results?.files;

        if (files?.length) {
          return files[0]; // presigned URL
        }
        setError("No downloadable file found.");
        return undefined;
      } catch {
        setError("Could not generate download link.");
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [] // keep dependency array empty – functions/values inside are stable
  );

  return { getUrl, loading, error };
};
