export interface IMediaS3ContentResponse {
  ETag: string;
  Key: string;
  LastModified: string;
  Size: number;
  StorageClass: string;
}

export interface IPropertyMediaDateResponse {
  contents: IMediaS3ContentResponse[];
  success: boolean;
}

// Property Media API Request and Response
export interface IPropertyMediaResponse {
  id?: number;
  property_id: number;
  alt: string | null;
  path: string | null;
  caption?: string | null;
  file_mime?: string | null;
  file_type?: string | null;
  category?: string | null;
  is_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface IAddPropertyMediaResponse {
  id: number;
  propertyId: number;
  alt?: string | null;
  path: string;
  caption?: string | null;
  file_mime?: string | null;
  file_type?: string | null;
  category?: string | null;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface IAddPropertyMediaRequest {
  media_id?: number;
  property_id: number;
  alt?: string | null;
  path: string;
  caption?: string | null;
  file_mime?: string | null;
  file_type?: string | null;
  category?: string | null;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface IPropertyDeleteMediaResponse {
  detail: string;
  id: number;
  success: boolean;
}

export interface IReportMediaItem {
  Key: string;
  LastModified: string;
  Size: number;
  FullPath: string;
}

export interface IReportMediaListResponse {
  success: boolean;
  message: string;
  results: IReportMediaItem[];
  errors: any[];
}

export interface IServiceMediaListItem {
  folder: string[];
  files: string[];
}

export interface IServiceMediaListResponse {
  results: IServiceMediaListItem;
  path: string;
  bucket: string;
  prefix: string;
  errors?: string;
}

export interface PropertyIdRequired {
  property_id: number;
}

export interface ReportTypeRequired {
  type: "night_audit" | "direct_billing_invoice";
}

export interface GetS3ReportListParams
  extends PropertyIdRequired,
    ReportTypeRequired {
  [key: any]: any;
}
