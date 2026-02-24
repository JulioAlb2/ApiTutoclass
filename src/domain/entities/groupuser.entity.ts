export interface IGroupUser {
  id: number;
  groupId: number;
  userId: number;
  joinedAt: Date;
}

export class GroupUser implements IGroupUser {
  constructor(
    public readonly id: number,
    public readonly groupId: number,
    public readonly userId: number,
    public readonly joinedAt: Date
  ) {}
}