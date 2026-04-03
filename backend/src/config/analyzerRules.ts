import { TicketCategory } from "../types.js";

export const categoryKeywords: Record<TicketCategory, string[]> = {
  Billing: ["billing", "invoice", "charge", "charged", "payment", "refund", "subscription", "plan", "credit card"],
  Technical: ["bug", "error", "exception", "crash", "failed", "down", "latency", "slow", "timeout", "api", "broken", "security", "breach"],
  Account: ["login", "sign in", "password", "locked out", "account", "profile", "verification", "2fa", "unauthorized access"],
  "Feature Request": ["feature", "enhancement", "improve", "request", "wishlist", "would like", "please add", "integration"],
  Other: []
};

export const urgencyKeywords = ["urgent", "asap", "immediately", "critical", "down", "blocked", "cannot", "can't", "outage"];

export const severityKeywords = ["refund", "failed", "breach", "data loss", "hacked", "unauthorized", "stolen", "outage", "crash", "broken"];

export const stopWords = new Set(["the", "and", "for", "with", "that", "this", "from", "have", "into", "about", "after", "please", "help", "need", "our", "your", "you", "been", "not", "are", "was", "were"]);

export const customSecurityKeywords = ["security", "breach", "hacked", "unauthorized access", "data leak", "data exposure", "compromised"];
