export interface PostingCodeDepartmentOutputForGroups {
  id: number;
  posting_code_department_name: string;
  posting_code_department_id: number;
}

export interface PostingCodeDepartmentGroup {
  id: number;
  name: string;
  targeted_departments: PostingCodeDepartmentOutputForGroups[];
}

export type GetPostingCodeDepartmentGroupsResponse = PostingCodeDepartmentGroup[];

export interface IGetPostingCodeDepartmentGroupsParams {
  property_id: number;
}
