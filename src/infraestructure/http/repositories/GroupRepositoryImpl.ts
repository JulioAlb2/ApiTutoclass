import { IGroupRepository } from "../../../domain/interfaces/IGroupRepository";
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
      const result = await db.query(
        "SELECT * FROM grupos WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) return null;
      return mapRowToGroup(result.rows[0] as GroupRow);
    } catch (error) {
      throw new Error(`Error al buscar grupo por ID: ${error}`);
    }
  }

  async findByCode(code: string): Promise<Group | null> {
    try {
      const result = await db.query(
        "SELECT * FROM grupos WHERE codigo_acceso = $1",
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
        "SELECT * FROM grupos WHERE estado = $1 ORDER BY fecha DESC, id",
        [GroupStatus.ACTIVE]
      );
      return result.rows.map((row:GroupRow) => mapRowToGroup(row as GroupRow));
    } catch (error) {
      throw new Error(`Error al listar grupos activos: ${error}`);
    }
  }

  async findByTeacher(teacherId: number): Promise<Group[]> {
    try {
      const result = await db.query(
        "SELECT * FROM grupos WHERE profesor_id = $1 ORDER BY fecha DESC, id",
        [teacherId]
      );
      return result.rows.map((row:GroupRow) => mapRowToGroup(row as GroupRow));
    } catch (error) {
      throw new Error(`Error al buscar grupos del profesor: ${error}`);
    }
  }

  async findByStudent(studentId: number): Promise<Group[]> {
    try {
      const result = await db.query(
        `SELECT g.* FROM grupos g
         INNER JOIN grupo_usuarios gu ON g.id = gu.grupo_id
         WHERE gu.usuario_id = $1
         ORDER BY g.fecha DESC, g.id`,
        [studentId]
      );
      return result.rows.map((row:GroupRow) => mapRowToGroup(row as GroupRow));
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *`,
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
      return mapRowToGroup(result.rows[0] as GroupRow);
    } catch (error) {
      throw new Error(`Error al crear grupo: ${error}`);
    }
  }

  async update(id: number, data: Partial<Group>): Promise<Group | null> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let index = 1;

      if (data.name !== undefined) {
        fields.push(`nombre = $${index++}`);
        values.push(data.name);
      }
      if (data.subject !== undefined) {
        fields.push(`materia = $${index++}`);
        values.push(data.subject);
      }
      if (data.description !== undefined) {
        fields.push(`descripcion = $${index++}`);
        values.push(data.description);
      }
      if (data.date !== undefined) {
        fields.push(`fecha = $${index++}`);
        values.push(data.date);
      }
      if (data.status !== undefined) {
        fields.push(`estado = $${index++}`);
        values.push(data.status);
      }

      if (fields.length === 0) {
        return this.findById(id);
      }

      fields.push("updated_at = NOW()");
      values.push(id);

      const result = await db.query(
        `UPDATE grupos SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
        values
      );
      if (result.rows.length === 0) return null;
      return mapRowToGroup(result.rows[0] as GroupRow);
    } catch (error) {
      throw new Error(`Error al actualizar grupo: ${error}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await db.query("DELETE FROM grupo_usuarios WHERE grupo_id = $1", [id]);
      const result = await db.query(
        "DELETE FROM grupos WHERE id = $1 RETURNING id",
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar grupo: ${error}`);
    }
  }

  async addStudent(groupId: number, studentId: number): Promise<void> {
    try {
      await db.query(
        `INSERT INTO grupo_usuarios (grupo_id, usuario_id, joined_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (grupo_id, usuario_id) DO NOTHING`,
        [groupId, studentId]
      );
    } catch (error) {
      throw new Error(`Error al inscribir alumno en el grupo: ${error}`);
    }
  }

  async removeStudent(groupId: number, studentId: number): Promise<void> {
    try {
      await db.query(
        "DELETE FROM grupo_usuarios WHERE grupo_id = $1 AND usuario_id = $2",
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
        "SELECT 1 FROM grupo_usuarios WHERE grupo_id = $1 AND usuario_id = $2",
        [groupId, studentId]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al verificar inscripción: ${error}`);
    }
  }
}
