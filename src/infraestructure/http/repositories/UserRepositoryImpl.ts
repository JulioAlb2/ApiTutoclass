// src/infrastructure/repositories/user.repository.impl.ts
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { db } from "../database/connection";
import { User } from "../../../domain/entities/user.entity";
import { Role } from "../../../domain/enums/rol.enums";

type UserRow = {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  created_at: Date;
  updated_at: Date;
};

function mapRowToUser(row: UserRow): User {
  return new User(
    row.id,
    row.nombre,
    row.email,
    row.password,
    row.rol as Role,
    new Date(row.created_at),
    new Date(row.updated_at)
  );
}

export class UserRepositoryImpl implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT * FROM usuarios WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) return null;
      
      return mapRowToUser(result.rows[0] as UserRow);
    } catch (error) {
      throw new Error(`Error al buscar usuario por ID: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT * FROM usuarios WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) return null;
      
      return mapRowToUser(result.rows[0] as UserRow);
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const result = await db.query(
        'SELECT * FROM usuarios ORDER BY id'
      );
      return result.rows.map((row:UserRow) => mapRowToUser(row as UserRow));
    } catch (error) {
      throw new Error(`Error al listar usuarios: ${error}`);
    }
  }

  async findByGroup(groupId: number): Promise<User[]> {
    try {
      const result = await db.query(
        `SELECT u.* FROM usuarios u
         INNER JOIN grupo_usuarios gu ON u.id = gu.usuario_id
         WHERE gu.grupo_id = $1`,
        [groupId]
      );
      
      return result.rows.map((row:UserRow) => mapRowToUser(row as UserRow));
    } catch (error) {
      throw new Error(`Error al buscar usuarios por grupo: ${error}`);
    }
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const { name, email, password, role } = userData;
      
      const result = await db.query(
        `INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING *`,
        [name, email, password, role]
      );
      
      return mapRowToUser(result.rows[0] as UserRow);
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error}`);
    }
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      if (data.name) {
        fields.push(`nombre = $${index++}`);
        values.push(data.name);
      }
      if (data.email) {
        fields.push(`email = $${index++}`);
        values.push(data.email);
      }
      if (data.password) {
        fields.push(`password = $${index++}`);
        values.push(data.password);
      }
      if (data.role) {
        fields.push(`rol = $${index++}`);
        values.push(data.role);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE usuarios 
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
      `;

      const result = await db.query(query, values);
      
      if (result.rows.length === 0) return null;
      
      return mapRowToUser(result.rows[0] as UserRow);
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await db.query(
        'DELETE FROM usuarios WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error}`);
    }
  }
}