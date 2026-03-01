import { Group } from "../entities/group.entity";


export interface IGroupRepository {
    
  findById(id: number): Promise<Group | null>;
  findByCode(code: string): Promise<Group | null>;
  findAllActive(): Promise<Group[]>;
  findByTeacher(teacherId: number): Promise<Group[]>;
  findByStudent(studentId: number): Promise<Group[]>;


  create(group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group>;
  update(id: number, data: Partial<Group>): Promise<Group | null>;
  delete(id: number): Promise<boolean>;


  addStudent(groupId: number, studentId: number): Promise<void>;
  removeStudent(groupId: number, studentId: number): Promise<void>;
  isStudentEnrolled(groupId: number, studentId: number): Promise<boolean>;
}