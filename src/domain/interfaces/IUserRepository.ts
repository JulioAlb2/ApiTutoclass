import { User } from "../entities/user.entity";

export interface IUserRepository {
 
 
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByGroup(groupId: number): Promise<User[]>;


  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User | null>;
  
  delete(id: number): Promise<boolean>;

}