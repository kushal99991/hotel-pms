import { ReservationStatusEnum } from "constants/reservation";

export interface ISetting {
  key: string;
  value: string;
  info: string;
  is_public?: boolean;
  property_id: number;
  type?: string;
  rule?: { name?: string; color?: string };
}

export interface ICreateSettingRequest extends ISetting {
  id?: number;
}

export interface IUpdateSettingRequest extends Partial<ISetting> {
  id: number;
}

export interface ISettingResponse extends ISetting {
  id: number;
}

export interface IReservationStatusEnum {
  name: ReservationStatusEnum;
  description: string;
  bg_color: string;
  text_color: string;
}

export interface IReservationStatusEnumOptions {
  label: string;
  value: string;
}
