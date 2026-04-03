import { Request, Response } from "express";
import { analyzeAndStoreTicket, getRecentTickets } from "../services/ticketService.js";

const validateMessage = (message: unknown) => {
  if (typeof message !== "string") {
    return "message must be a string";
  }

  if (!message.trim()) {
    return "message is required";
  }

  if (message.length > 2000) {
    return "message must be 2000 characters or fewer";
  }

  return null;
};

export const analyzeTicketController = async (req: Request, res: Response) => {
  const error = validateMessage(req.body?.message);

  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const ticket = await analyzeAndStoreTicket(req.body.message.trim());
    return res.status(201).json(ticket);
  } catch {
    return res.status(500).json({ error: "Failed to analyze ticket" });
  }
};

export const listTicketsController = async (_req: Request, res: Response) => {
  try {
    const tickets = await getRecentTickets();
    return res.json({ tickets });
  } catch {
    return res.status(500).json({ error: "Failed to load tickets" });
  }
};
