import { MessageType } from "../enums/messages.enum";


export interface IMessage {
  id: number;
  groupId: number;
  userId: number;
  userName: string;
  userRole: string;
  text: string;
  type: MessageType;
  createdAt: Date ;
  edited: boolean;
  editedAt: Date;
}

export class Message implements IMessage {
  constructor(
    public readonly id: number,
    public readonly groupId: number,
    public readonly userId: number,
    public readonly userName: string,
    public readonly userRole: string,
    public text: string,
    public readonly type: MessageType,
    public readonly createdAt: Date,
    public edited: boolean = false,
    public editedAt: Date
  ) {}
}