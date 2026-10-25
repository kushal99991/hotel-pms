import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { appConfig } from "config/app.config";
import {
  GetS3ReportListParams,
  IServiceMediaListResponse,
} from "types/propertyMediaTypes";

const useGetS3ReportFilesList = (
  params: GetS3ReportListParams
): [
  () => Promise<
    | IServiceMediaListResponse
    | {
        error: AxiosError<unknown, any>;
      }
  >,
  Record<any, any>,
] => {
  const [data, setData] = useState<IServiceMediaListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getFileList = useCallback(async (): Promise<
    IServiceMediaListResponse | { error: AxiosError<unknown, any> }
  > => {
    try {
      setLoading(true);
      setError(null);
      setData(null);

      const tenantToken = appConfig.getCookie(appConfig.tokenName) || "default";
      const dataParams = {
        ...params,
        bucket: appConfig.s3ReportBucketName,
        tenant: tenantToken,
      };
      const fullUrl = `${appConfig.paymentsAPI}/reports/list`;
      const dataResponse = await axios.get<IServiceMediaListResponse>(fullUrl, {
        params: dataParams,
        headers: {
          "X-API-KEY": appConfig.mediaAPIKey,
          Authorization: `Bearer ${tenantToken}`,
        },
      });
      setData(dataResponse.data);
      setLoading(false);
      return dataResponse.data;
    } catch (err: unknown) {
      const errorMessage =
        (err as AxiosError).message ?? "An error occurred getting file URL";
      setError(errorMessage);
      setLoading(false);
      return {
        error: err as AxiosError,
      };
    }
  }, [params]);

  return [
    getFileList,
    {
      data,
      error,
      loading,
    },
  ];
};

export default useGetS3ReportFilesList;
