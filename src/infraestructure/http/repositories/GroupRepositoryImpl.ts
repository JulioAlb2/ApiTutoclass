import type { IGroupRepository, GroupStudent } from "../../../domain/interfaces/IGroupRepository";
import { db } from "../database/connection";
import { Group } from "../../../domain/entities/group.entity";
import { GroupStatus } from "../../../domain/enums/stateGroup.enum";

type GroupRow = {
  id: number;
  nombre: string;
  materia: string;
  descripcion: string | null;
  profesor_id: number;
  nombre_profesor: string;
  fecha: Date;
  codigo_acceso: string;
  estado: string;
  created_at: Date;
  updated_at: Date;
};

function mapRowToGroup(row: GroupRow): Group {
  return new Group(
    row.id,
    row.nombre,
    row.materia,
    row.descripcion,
    row.profesor_id,
    row.nombre_profesor,
    new Date(row.fecha),
    row.codigo_acceso,
    row.estado as GroupStatus,
    new Date(row.created_at),
    new Date(row.updated_at)
  );
}

export class GroupRepositoryImpl implements IGroupRepository {
  async findById(id: number): Promise<Group | null> {
    try {
      const result = await db.query("SELECT * FROM grupos WHERE id = ?", [id]);
      if (result.rows.length === 0) return null;
      return mapRowToGroup(result.rows[0] as GroupRow);
    } catch (error) {
      throw new Error(`Error al buscar grupo por ID: ${error}`);
    }
  }

  async findByCode(code: string): Promise<Group | null> {
    try {
      const result = await db.query(
        "SELECT * FROM grupos WHERE codigo_acceso = ?",
        [code]
      );
      if (result.rows.length === 0) return null;
      return mapRowToGroup(result.rows[0] as GroupRow);
    } catch (error) {
      throw new Error(`Error al buscar grupo por código: ${error}`);
    }
  }

  async findAllActive(): Promise<Group[]> {
    try {
      const result = await db.query(
        "SELECT * FROM grupos WHERE estado = ? ORDER BY fecha DESC, id",
        [GroupStatus.ACTIVE]
      );
      return result.rows.map((row) => mapRowToGroup(row as GroupRow));
    } catch (error) {
      throw new Error(`Error al listar grupos activos: ${error}`);
    }
  }

  async findByTeacher(teacherId: number): Promise<Group[]> {
    try {
      const result = await db.query(
        "SELECT * FROM grupos WHERE profesor_id = ? ORDER BY fecha DESC, id",
        [teacherId]
      );
      return result.rows.map((row) => mapRowToGroup(row as GroupRow));
    } catch (error) {
      throw new Error(`Error al buscar grupos del profesor: ${error}`);
    }
  }

  async findByStudent(studentId: number): Promise<Group[]> {
    try {
      const result = await db.query(
        `SELECT g.* FROM grupos g
         INNER JOIN grupo_usuarios gu ON g.id = gu.grupo_id
         WHERE gu.usuario_id = ?
         ORDER BY g.fecha DESC, g.id`,
        [studentId]
      );
      return result.rows.map((row) => mapRowToGroup(row as GroupRow));
    } catch (error) {
      throw new Error(`Error al buscar grupos del alumno: ${error}`);
    }
  }

  async create(
    data: Omit<Group, "id" | "createdAt" | "updatedAt">
  ): Promise<Group> {
    try {
      const {
        name,
        subject,
        description,
        teacherId,
        teacherName,
        date,
        accessCode,
        status,
      } = data;
      const result = await db.query(
        `INSERT INTO grupos (
          nombre, materia, descripcion, profesor_id, nombre_profesor,
          fecha, codigo_acceso, estado, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          name,
          subject,
          description ?? null,
          teacherId,
          teacherName,
          date,
          accessCode,
          status,
        ]
      );
      const insertId = result.insertId;
      if (insertId == null) throw new Error("Error al obtener ID del grupo");
      const created = await this.findById(Number(insertId));
      if (!created) throw new Error("Error al recuperar grupo creado");
      return created;
    } catch (error) {
      throw new Error(`Error al crear grupo: ${error}`);
    }
  }

  async update(id: number, data: Partial<Group>): Promise<Group | null> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];

      if (data.name !== undefined) {
        fields.push("nombre = ?");
        values.push(data.name);
      }
      if (data.subject !== undefined) {
        fields.push("materia = ?");
        values.push(data.subject);
      }
      if (data.description !== undefined) {
        fields.push("descripcion = ?");
        values.push(data.description);
      }
      if (data.date !== undefined) {
        fields.push("fecha = ?");
        values.push(data.date);
      }
      if (data.status !== undefined) {
        fields.push("estado = ?");
        values.push(data.status);
      }

      if (fields.length === 0) {
        return this.findById(id);
      }

      fields.push("updated_at = NOW()");
      values.push(id);

      await db.query(
        `UPDATE grupos SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
      return this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar grupo: ${error}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await db.query("DELETE FROM grupo_usuarios WHERE grupo_id = ?", [id]);
      const result = await db.query("DELETE FROM grupos WHERE id = ?", [id]);
      return (result.affectedRows ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error al eliminar grupo: ${error}`);
    }
  }

  async addStudent(groupId: number, studentId: number): Promise<void> {
    try {
      await db.query(
        `INSERT IGNORE INTO grupo_usuarios (grupo_id, usuario_id, joined_at)
         VALUES (?, ?, NOW())`,
        [groupId, studentId]
      );
    } catch (error) {
      throw new Error(`Error al inscribir alumno en el grupo: ${error}`);
    }
  }

  async removeStudent(groupId: number, studentId: number): Promise<void> {
    try {
      await db.query(
        "DELETE FROM grupo_usuarios WHERE grupo_id = ? AND usuario_id = ?",
        [groupId, studentId]
      );
    } catch (error) {
      throw new Error(`Error al dar de baja alumno del grupo: ${error}`);
    }
  }

  async isStudentEnrolled(
    groupId: number,
    studentId: number
  ): Promise<boolean> {
    try {
      const result = await db.query(
        "SELECT 1 FROM grupo_usuarios WHERE grupo_id = ? AND usuario_id = ?",
        [groupId, studentId]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al verificar inscripción: ${error}`);
    }
  }

  async getStudentsByGroup(groupId: number): Promise<GroupStudent[]> {
    try {
      const result = await db.query(
        `SELECT u.id, u.nombre, u.email, gu.joined_at
         FROM usuarios u
         INNER JOIN grupo_usuarios gu ON u.id = gu.usuario_id
         WHERE gu.grupo_id = ?
         ORDER BY gu.joined_at ASC`,
        [groupId]
      );
      return result.rows.map((row) => {
        const r = row as { id: number; nombre: string; email: string; joined_at: Date };
        return {
          id: r.id,
          name: r.nombre,
          email: r.email,
          joinedAt: new Date(r.joined_at),
        };
      });
    } catch (error) {
      throw new Error(`Error al obtener alumnos del grupo: ${error}`);
    }
  }
}
