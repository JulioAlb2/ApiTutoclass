import { IMessageRepository } from "../../../domain/interfaces/IMessageRepository";
import { db } from "../database/connection";
import { Message } from "../../../domain/entities/menssaje.entity";
import { MessageType } from "../../../domain/enums/messages.enum";

type MessageRow = {
  id: number;
  grupo_id: number;
  usuario_id: number;
  nombre_usuario: string;
  rol_usuario: string;
  texto: string;
  tipo: string;
  created_at: Date;
  edited: boolean;
  edited_at: Date;
};

function mapRowToMessage(row: MessageRow): Message {
  return new Message(
    row.id,
    row.grupo_id,
    row.usuario_id,
    row.nombre_usuario,
    row.rol_usuario,
    row.texto,
    row.tipo as MessageType,
    new Date(row.created_at),
    row.edited ?? false,
    new Date(row.edited_at)
  );
}

export class MessageRepositoryImpl implements IMessageRepository {
  async findById(id: number): Promise<Message | null> {
    try {
      const result = await db.query("SELECT * FROM mensajes WHERE id = ?", [
        id,
      ]);
      if (result.rows.length === 0) return null;
      return mapRowToMessage(result.rows[0] as MessageRow);
    } catch (error) {
      throw new Error(`Error al buscar mensaje por ID: ${error}`);
    }
  }

  async findByGroup(
    groupId: number,
    limit?: number,
    from?: Date
  ): Promise<Message[]> {
    try {
      let query = "SELECT * FROM mensajes WHERE grupo_id = ?";
      const values: unknown[] = [groupId];

      if (from != null) {
        query += " AND created_at >= ?";
        values.push(from);
      }

      query += " ORDER BY created_at ASC";

      if (limit != null && limit > 0) {
        query += " LIMIT ?";
        values.push(limit);
      }

      const result = await db.query(query, values);
      return result.rows.map((row) => mapRowToMessage(row as MessageRow));
    } catch (error) {
      throw new Error(`Error al listar mensajes del grupo: ${error}`);
    }
  }

  async create(
    data: Omit<Message, "id" | "createdAt" | "edited" | "editedAt">
  ): Promise<Message> {
    try {
      const { groupId, userId, userName, userRole, text, type } = data;
      const result = await db.query(
        `INSERT INTO mensajes (
          grupo_id, usuario_id, nombre_usuario, rol_usuario, texto, tipo,
          created_at, edited, edited_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), 0, NOW())`,
        [groupId, userId, userName, userRole, text, type]
      );
      const insertId = result.insertId;
      if (insertId == null) throw new Error("Error al obtener ID del mensaje");
      const created = await this.findById(Number(insertId));
      if (!created) throw new Error("Error al recuperar mensaje creado");
      return created;
    } catch (error) {
      throw new Error(`Error al crear mensaje: ${error}`);
    }
  }

  async update(id: number, text: string): Promise<Message | null> {
    try {
      await db.query(
        `UPDATE mensajes
         SET texto = ?, edited = 1, edited_at = NOW()
         WHERE id = ?`,
        [text, id]
      );
      return this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar mensaje: ${error}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await db.query("DELETE FROM mensajes WHERE id = ?", [id]);
      return (result.affectedRows ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error al eliminar mensaje: ${error}`);
    }
  }
}
