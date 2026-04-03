export interface TicketSignals {
  urgencyDetected: boolean;
  urgencyTerms: string[];
  severityTerms: string[];
  categoryTerms: string[];
  keywords: string[];
  customRuleTriggered: boolean;
}

export interface Ticket {
  id: number;
  message: string;
  category: "Billing" | "Technical" | "Account" | "Feature Request" | "Other";
  priority: "P0" | "P1" | "P2" | "P3";
  confidence: number;
  signals: TicketSignals;
  createdAt: string;
}
