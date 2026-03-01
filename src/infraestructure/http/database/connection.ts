import "dotenv/config";
import mysql from "mysql2";

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? "3306", 10),
  database: process.env.DB_NAME ?? "tutoclass",
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
}).promise();

export type QueryResult = {
  rows: unknown[];
  insertId?: number | undefined;
  affectedRows?: number | undefined;
};

/**
 * Ejecuta una query. Devuelve { rows } para compatibilidad con el uso en repositorios.
 * Para INSERT devuelve además insertId; para UPDATE/DELETE, affectedRows.
 */
export const db = {
  query: async (
    sql: string,
    values?: unknown[]
  ): Promise<QueryResult> => {
    const [result] = await pool.execute(sql, (values ?? []) as (string | number | null)[]);
    if (Array.isArray(result)) {
      return { rows: result as unknown[] };
    }
    const header = result as { insertId?: number; affectedRows?: number };
    return {
      rows: [],
      insertId: header.insertId as number | undefined,
      affectedRows: header.affectedRows as number | undefined,
    };
  },
};

export { pool };

export async function checkConnection(): Promise<boolean> {
  try {
    const conn = await pool.getConnection();
    await conn.execute("SELECT 1");
    conn.release();
    return true;
  } catch {
    return false;
  }
}
