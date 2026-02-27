import { ITaskRepository } from "../../../domain/interfaces/ITaskRepository";
import { db } from "../database/connection";
import { Task } from "../../../domain/entities/task.entity";
import { TaskStatus } from "../../../domain/enums/task.enum";

type TaskRow = {
  id: number;
  titulo: string;
  descripcion: string;
  grupo_id: number;
  asignado_por: number;
  fecha_limite: Date;
  estado: string;
  created_at: Date;
  updated_at: Date;
};

function mapRowToTask(row: TaskRow): Task {
  return new Task(
    row.id,
    row.titulo,
    row.descripcion,
    row.grupo_id,
    row.asignado_por,
    new Date(row.fecha_limite),
    row.estado as TaskStatus,
    new Date(row.created_at),
    new Date(row.updated_at)
  );
}

export class TaskRepositoryImpl implements ITaskRepository {
  async findById(id: number): Promise<Task | null> {
    try {
      const result = await db.query("SELECT * FROM tareas WHERE id = ?", [id]);
      if (result.rows.length === 0) return null;
      return mapRowToTask(result.rows[0] as TaskRow);
    } catch (error) {
      throw new Error(`Error al buscar tarea por ID: ${error}`);
    }
  }

  async findByGroup(groupId: number): Promise<Task[]> {
    try {
      const result = await db.query("SELECT * FROM tareas WHERE grupo_id = ?", [groupId]);
      return (result.rows as TaskRow[]).map(mapRowToTask);
    } catch (error) {
      throw new Error(`Error al buscar tareas por grupo: ${error}`);
    }
  }

  async findByAssignedBy(assignedBy: number): Promise<Task[]> {
    try {
      const result = await db.query("SELECT * FROM tareas WHERE asignado_por = ?", [assignedBy]);
      return (result.rows as TaskRow[]).map(mapRowToTask);
    } catch (error) {
      throw new Error(`Error al buscar tareas por asignador: ${error}`);
    }
  }

  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const result = await db.query(
        "INSERT INTO tareas (titulo, descripcion, grupo_id, asignado_por, fecha_limite, estado, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [task.title, task.description, task.groupId, task.assignedBy, task.dueDate, task.status]
      );
      const insertedId = result.insertId;
      if (!insertedId) throw new Error("Error al crear tarea");
      const newTask = await this.findById(insertedId);
      if (!newTask) throw new Error("Error al crear tarea");
      return newTask;
    } catch (error) {
      throw new Error(`Error al crear tarea: ${error}`);
    }
  }

  async update(id: number, data: Partial<Task>): Promise<Task | null> {
    try {
      const fields = [];
      const values = [];
      if (data.title !== undefined) {
        fields.push("titulo = ?");
        values.push(data.title);
      }
      if (data.description !== undefined) {
        fields.push("descripcion = ?");
        values.push(data.description);
      }
      if (data.dueDate !== undefined) {
        fields.push("fecha_limite = ?");
        values.push(data.dueDate);
      }
      if (data.status !== undefined) {
        fields.push("estado = ?");
        values.push(data.status);
      }
      if (fields.length === 0) return await this.findById(id);
      fields.push("updated_at = NOW()");
      const query = `UPDATE tareas SET ${fields.join(", ")} WHERE id = ?`;
      values.push(id);
      await db.query(query, values);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar tarea: ${error}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await db.query("DELETE FROM tareas WHERE id = ?", [id]);
      return (result.affectedRows ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error al eliminar tarea: ${error}`);
    }
  }
}