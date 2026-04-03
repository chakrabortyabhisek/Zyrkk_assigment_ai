import { analyzeTicket } from "../analyzer/ticketAnalyzer.js";
import { insertTicket, listTickets } from "../repositories/ticketRepository.js";

export const analyzeAndStoreTicket = async (message: string) => {
  const analysis = analyzeTicket(message);
  return insertTicket(message, analysis);
};

export const getRecentTickets = async () => listTickets();
