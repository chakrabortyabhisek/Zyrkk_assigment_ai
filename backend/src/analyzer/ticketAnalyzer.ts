import {
  categoryKeywords,
  customSecurityKeywords,
  severityKeywords,
  stopWords,
  urgencyKeywords
} from "../config/analyzerRules.js";
import { TicketAnalysis, TicketCategory, TicketPriority } from "../types.js";

const normalizeText = (message: string) => message.toLowerCase().trim();

const findMatches = (text: string, keywords: string[]) =>
  keywords.filter((keyword) => text.includes(keyword));

const extractKeywords = (message: string, matchedTerms: string[]) => {
  const tokens = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3 && !stopWords.has(token));

  return [...new Set([...matchedTerms, ...tokens])].slice(0, 8);
};

const chooseCategory = (
  scores: Record<TicketCategory, number>,
  text: string
): TicketCategory => {
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topCategory, topScore] = ranked[0] as [TicketCategory, number];

  if (topScore === 0) {
    return "Other";
  }

  if (text.includes("refund")) {
    return "Billing";
  }

  return topCategory;
};

const determinePriority = ({
  urgencyCount,
  severityCount,
  customSecurityTriggered
}: {
  urgencyCount: number;
  severityCount: number;
  customSecurityTriggered: boolean;
}): TicketPriority => {
  if (customSecurityTriggered && urgencyCount > 0) {
    return "P0";
  }

  if (customSecurityTriggered || urgencyCount >= 2 || severityCount >= 3) {
    return "P1";
  }

  if (urgencyCount === 1 || severityCount >= 1) {
    return "P2";
  }

  return "P3";
};

const calculateConfidence = ({
  categoryScore,
  urgencyCount,
  severityCount,
  customSecurityTriggered
}: {
  categoryScore: number;
  urgencyCount: number;
  severityCount: number;
  customSecurityTriggered: boolean;
}) => {
  const base = 0.35;
  const categoryBoost = Math.min(categoryScore * 0.12, 0.36);
  const urgencyBoost = Math.min(urgencyCount * 0.08, 0.16);
  const severityBoost = Math.min(severityCount * 0.06, 0.12);
  const customBoost = customSecurityTriggered ? 0.1 : 0;

  return Math.min(
    0.98,
    Number((base + categoryBoost + urgencyBoost + severityBoost + customBoost).toFixed(2))
  );
};

export const analyzeTicket = (message: string): TicketAnalysis => {
  const text = normalizeText(message);
  const categoryScores = Object.entries(categoryKeywords).reduce(
    (scores, [category, keywords]) => {
      scores[category as TicketCategory] = findMatches(text, keywords).length;
      return scores;
    },
    {
      Billing: 0,
      Technical: 0,
      Account: 0,
      "Feature Request": 0,
      Other: 0
    } as Record<TicketCategory, number>
  );

  const category = chooseCategory(categoryScores, text);
  const urgencyTerms = findMatches(text, urgencyKeywords);
  const severityTerms = findMatches(text, severityKeywords);
  const categoryTerms =
    category === "Other" ? [] : findMatches(text, categoryKeywords[category]);
  const customSecurityTriggered =
    findMatches(text, customSecurityKeywords).length > 0;
  const priority = determinePriority({
    urgencyCount: urgencyTerms.length,
    severityCount: severityTerms.length,
    customSecurityTriggered
  });

  return {
    category,
    priority,
    confidence: calculateConfidence({
      categoryScore: categoryScores[category],
      urgencyCount: urgencyTerms.length,
      severityCount: severityTerms.length,
      customSecurityTriggered
    }),
    signals: {
      urgencyDetected: urgencyTerms.length > 0,
      urgencyTerms,
      severityTerms,
      categoryTerms,
      keywords: extractKeywords(message, [
        ...urgencyTerms,
        ...severityTerms,
        ...categoryTerms
      ]),
      customRuleTriggered: customSecurityTriggered
    }
  };
};
