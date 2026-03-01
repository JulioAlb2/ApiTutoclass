import { GroupStatus } from "../enums/stateGroup.enum";

export interface IGroup {
  id: number;
  name: string;
  subject: string;
  description: string | null;
  teacherId: number;
  teacherName: string;
  date: Date;
  accessCode: string;
  status: GroupStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Group implements IGroup {
  constructor(
    public readonly id: number,
    public name: string,
    public subject: string,
    public description: string | null,
    public readonly teacherId: number,
    public readonly teacherName: string,
    public date: Date,
    public readonly accessCode: string,
    public status: GroupStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
