import { ISubmissionRepository } from "../../../domain/interfaces/ISubmissionRepository";
import { db } from "../database/connection";
import { Submission } from "../../../domain/entities/submission.entity";

type SubmissionRow = {
  id: number;
  tarea_id: number;
  estudiante_id: number;
  nombre_archivo: string;
  ruta_archivo: string;
  fecha_entrega: Date;
  calificacion?: number;
  retroalimentacion?: string;
};

function mapRowToSubmission(row: SubmissionRow): Submission {
  return new Submission(
    row.id,
    row.tarea_id,
    row.estudiante_id,
    row.nombre_archivo,
    row.ruta_archivo,
    new Date(row.fecha_entrega),
    row.calificacion,
    row.retroalimentacion
  );
}

export class SubmissionRepositoryImpl implements ISubmissionRepository {
  async findById(id: number): Promise<Submission | null> {
    try {
      const result = await db.query("SELECT * FROM entregas WHERE id = ?", [id]);
      if (result.rows.length === 0) return null;
      return mapRowToSubmission(result.rows[0] as SubmissionRow);
    } catch (error) {
      throw new Error(`Error al buscar entrega por ID: ${error}`);
    }
  }

  async findByTask(taskId: number): Promise<Submission[]> {
    try {
      const result = await db.query("SELECT * FROM entregas WHERE tarea_id = ?", [taskId]);
      return (result.rows as SubmissionRow[]).map(mapRowToSubmission);
    } catch (error) {
      throw new Error(`Error al buscar entregas por tarea: ${error}`);
    }
  }

  async findByStudent(studentId: number): Promise<Submission[]> {
    try {
      const result = await db.query("SELECT * FROM entregas WHERE estudiante_id = ?", [studentId]);
      return (result.rows as SubmissionRow[]).map(mapRowToSubmission);
    } catch (error) {
      throw new Error(`Error al buscar entregas por estudiante: ${error}`);
    }
  }

  async create(submission: Omit<Submission, 'id' | 'submittedAt'>): Promise<Submission> {
    try {
      const result = await db.query(
        "INSERT INTO entregas (tarea_id, estudiante_id, nombre_archivo, ruta_archivo, fecha_entrega, calificacion, retroalimentacion) VALUES (?, ?, ?, ?, NOW(), ?, ?)",
        [submission.taskId, submission.studentId, submission.fileName, submission.filePath, submission.grade ?? null, submission.feedback ?? null]
      );
      const insertedId = result.insertId;
      if (!insertedId) throw new Error("Error al crear entrega");
      const newSubmission = await this.findById(insertedId);
      if (!newSubmission) throw new Error("Error al crear entrega");
      return newSubmission;
    } catch (error) {
      throw new Error(`Error al crear entrega: ${error}`);
    }
  }

  async update(id: number, data: Partial<Submission>): Promise<Submission | null> {
    try {
      const fields = [];
      const values = [];
      if (data.grade !== undefined) {
        fields.push("calificacion = ?");
        values.push(data.grade);
      }
      if (data.feedback !== undefined) {
        fields.push("retroalimentacion = ?");
        values.push(data.feedback);
      }
      if (fields.length === 0) return await this.findById(id);
      const query = `UPDATE entregas SET ${fields.join(", ")} WHERE id = ?`;
      values.push(id);
      await db.query(query, values);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar entrega: ${error}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await db.query("DELETE FROM entregas WHERE id = ?", [id]);
      return (result.affectedRows ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error al eliminar entrega: ${error}`);
    }
  }
}