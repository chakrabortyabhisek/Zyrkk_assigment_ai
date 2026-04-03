import { getDb, saveDb } from "../db/database.js";
import { TicketAnalysis, TicketRecord } from "../types.js";

export const insertTicket = async (
  message: string,
  analysis: TicketAnalysis
): Promise<TicketRecord> => {
  const db = await getDb();
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO tickets (message, category, priority, confidence, signals, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    message,
    analysis.category,
    analysis.priority,
    analysis.confidence,
    JSON.stringify(analysis.signals),
    createdAt
  ]);
  stmt.free();
  saveDb();

  const result = db.exec("SELECT last_insert_rowid() AS id");
  const id = Number(result[0]?.values[0]?.[0] ?? 0);

  return {
    id,
    message,
    createdAt,
    ...analysis
  };
};

export const listTickets = async (limit = 20): Promise<TicketRecord[]> => {
  const db = await getDb();
  const stmt = db.prepare(`
    SELECT id, message, category, priority, confidence, signals, created_at
    FROM tickets
    ORDER BY id DESC
    LIMIT ?
  `);

  stmt.bind([limit]);
  const rows: TicketRecord[] = [];

  while (stmt.step()) {
    const row = stmt.getAsObject();
    rows.push({
      id: Number(row.id),
      message: String(row.message),
      category: String(row.category) as TicketRecord["category"],
      priority: String(row.priority) as TicketRecord["priority"],
      confidence: Number(row.confidence),
      signals: JSON.parse(String(row.signals)),
      createdAt: String(row.created_at)
    });
  }

  stmt.free();
  return rows;
};
