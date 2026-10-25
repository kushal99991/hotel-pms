export interface IAddEmailTemplateRequest {
  id?: number;
  name: string;
  subject: string;
  category: string;
  fromAddress: string;
  body: string;
}

export interface EmailTemplateResponse {
  id: number;
  name: string;
  subject: string;
  category: "Confirmation";
  from_address: string;
  body: string;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}

export type EmailTemplateTagResponse = Array<string>;

export interface EmailTemplateTag {
  id: string;
  name: string;
}

export interface EmailTemplateResponse {
  id: number;
  name: string;
  subject: string;
  category: string;
  from_address: string;
  body: string;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  category: string;
  fromAddress: string;
  body: string;
  createdBy: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
}
