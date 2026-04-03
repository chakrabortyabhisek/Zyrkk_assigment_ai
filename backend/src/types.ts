export type TicketCategory =
  | "Billing"
  | "Technical"
  | "Account"
  | "Feature Request"
  | "Other";

export type TicketPriority = "P0" | "P1" | "P2" | "P3";

export interface TicketAnalysisSignals {
  urgencyDetected: boolean;
  urgencyTerms: string[];
  severityTerms: string[];
  categoryTerms: string[];
  keywords: string[];
  customRuleTriggered: boolean;
}

export interface TicketAnalysis {
  category: TicketCategory;
  priority: TicketPriority;
  confidence: number;
  signals: TicketAnalysisSignals;
}

export interface TicketRecord extends TicketAnalysis {
  id: number;
  message: string;
  createdAt: string;
}
