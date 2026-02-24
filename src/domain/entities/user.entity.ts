import { Role } from "../enums/rol.enums";


export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements IUser {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public password: string,
    public readonly role: Role,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}