import { Ticket } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export const analyzeTicket = async (message: string): Promise<Ticket> => {
  const response = await fetch(`${API_BASE_URL}/tickets/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(payload.error ?? "Request failed");
  }

  return response.json();
};

export const fetchTickets = async (): Promise<Ticket[]> => {
  const response = await fetch(`${API_BASE_URL}/tickets`);

  if (!response.ok) {
    throw new Error("Failed to load tickets");
  }

  const payload = await response.json();
  return payload.tickets;
};
