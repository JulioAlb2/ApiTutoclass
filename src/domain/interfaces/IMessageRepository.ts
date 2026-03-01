import { Message } from "../entities/menssaje.entity";

export interface IMessageRepository {
  findById(id: number): Promise<Message | null>;
  findByGroup(groupId: number, limit?: number, from?: Date): Promise<Message[]>;

  create(message: Omit<Message, 'id' | 'createdAt' | 'edited' | 'editedAt'>): Promise<Message>;
  update(id: number, text: string): Promise<Message | null>;
  
  delete(id: number): Promise<boolean>;
}