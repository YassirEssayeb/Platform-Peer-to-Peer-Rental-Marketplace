import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rent_marketplace',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql: string, params?: any[]) {
  const [results] = await pool.execute(sql, params);
  return results;
}

export async function getRow(sql: string, params?: any[]) {
  const [results] = await pool.execute(sql, params);
  const rows = results as any[];
  return rows.length > 0 ? rows[0] : null;
}

export async function insert(sql: string, params?: any[]) {
  const [result] = await pool.execute(sql, params);
  return (result as any).insertId;
}

export default pool;
