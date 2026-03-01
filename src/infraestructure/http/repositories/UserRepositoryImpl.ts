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
      const result = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);
      if (result.rows.length === 0) return null;
      return mapRowToUser(result.rows[0] as UserRow);
    } catch (error) {
      throw new Error(`Error al buscar usuario por ID: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.query("SELECT * FROM usuarios WHERE email = ?", [
        email,
      ]);
      if (result.rows.length === 0) return null;
      return mapRowToUser(result.rows[0] as UserRow);
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const result = await db.query("SELECT * FROM usuarios ORDER BY id");
      return result.rows.map((row) => mapRowToUser(row as UserRow));
    } catch (error) {
      throw new Error(`Error al listar usuarios: ${error}`);
    }
  }

  async findByGroup(groupId: number): Promise<User[]> {
    try {
      const result = await db.query(
        `SELECT u.* FROM usuarios u
         INNER JOIN grupo_usuarios gu ON u.id = gu.usuario_id
         WHERE gu.grupo_id = ?`,
        [groupId]
      );
      return result.rows.map((row) => mapRowToUser(row as UserRow));
    } catch (error) {
      throw new Error(`Error al buscar usuarios por grupo: ${error}`);
    }
  }

  async create(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    try {
      const { name, email, password, role } = userData;
      const result = await db.query(
        `INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [name, email, password, role]
      );
      const insertId = result.insertId;
      if (insertId == null) throw new Error("Error al obtener ID del usuario");
      const created = await this.findById(Number(insertId));
      if (!created) throw new Error("Error al recuperar usuario creado");
      return created;
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error}`);
    }
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];

      if (data.name) {
        fields.push("nombre = ?");
        values.push(data.name);
      }
      if (data.email) {
        fields.push("email = ?");
        values.push(data.email);
      }
      if (data.password) {
        fields.push("password = ?");
        values.push(data.password);
      }
      if (data.role) {
        fields.push("rol = ?");
        values.push(data.role);
      }

      fields.push("updated_at = NOW()");
      values.push(id);

      await db.query(
        `UPDATE usuarios SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
      return this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await db.query("DELETE FROM usuarios WHERE id = ?", [id]);
      return (result.affectedRows ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error}`);
    }
  }
}
