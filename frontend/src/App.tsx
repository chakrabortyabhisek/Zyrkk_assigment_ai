import { FormEvent, useEffect, useState } from "react";
import { analyzeTicket, fetchTickets } from "./api";
import { Ticket } from "./types";

const defaultExample =
  "Urgent: customers are reporting unauthorized access after login and we suspect a security breach.";

function App() {
  const [message, setMessage] = useState(defaultExample);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [result, setResult] = useState<Ticket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    setIsLoadingTickets(true);

    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to load tickets");
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const analyzed = await analyzeTicket(message);
      setResult(analyzed);
      setTickets((current) => [analyzed, ...current.filter((ticket) => ticket.id !== analyzed.id)]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to analyze ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">AI-Powered Support Ticket Triage</p>
        <h1>Analyze support messages with local rules, not external AI.</h1>
        <p className="hero-copy">
          Submit a ticket, inspect category and urgency signals, and review the latest
          stored analyses from the database.
        </p>
      </section>

      <section className="layout">
        <form className="panel composer" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <h2>Submit Ticket</h2>
            <span>POST /tickets/analyze</span>
          </div>

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Describe the support issue..."
            rows={8}
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Analyzing..." : "Analyze Ticket"}
          </button>

          {error ? <p className="error">{error}</p> : null}
        </form>

        <section className="panel result-panel">
          <div className="panel-heading">
            <h2>Latest Result</h2>
            <span>Signals + confidence</span>
          </div>

          {result ? (
            <div className="result-grid">
              <article>
                <label>Category</label>
                <strong>{result.category}</strong>
              </article>
              <article>
                <label>Priority</label>
                <strong>{result.priority}</strong>
              </article>
              <article>
                <label>Urgency</label>
                <strong>{result.signals.urgencyDetected ? "Detected" : "Not detected"}</strong>
              </article>
              <article>
                <label>Confidence</label>
                <strong>{Math.round(result.confidence * 100)}%</strong>
              </article>
              <article className="wide">
                <label>Keywords</label>
                <div className="tags">
                  {result.signals.keywords.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </article>
              <article className="wide">
                <label>Custom Rule</label>
                <strong>
                  {result.signals.customRuleTriggered
                    ? "Security escalation triggered"
                    : "No custom escalation"}
                </strong>
              </article>
            </div>
          ) : (
            <p className="empty-state">Run an analysis to see triage results here.</p>
          )}
        </section>
      </section>

      <section className="panel ticket-table">
        <div className="panel-heading">
          <h2>Recent Tickets</h2>
          <span>GET /tickets</span>
        </div>

        {isLoadingTickets ? (
          <p className="empty-state">Loading ticket history...</p>
        ) : tickets.length === 0 ? (
          <p className="empty-state">No tickets analyzed yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Message</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                    <td>{ticket.message}</td>
                    <td>{ticket.category}</td>
                    <td>{ticket.priority}</td>
                    <td>{Math.round(ticket.confidence * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
