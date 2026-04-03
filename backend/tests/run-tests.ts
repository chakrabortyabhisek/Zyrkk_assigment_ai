import assert from "node:assert/strict";
import request from "supertest";
import { analyzeTicket } from "../src/analyzer/ticketAnalyzer.js";
import { getDb } from "../src/db/database.js";
import { app } from "../src/app.js";

const run = async () => {
  const billingResult = analyzeTicket("I was charged twice and need a refund ASAP.");
  assert.equal(billingResult.category, "Billing");
  assert.equal(billingResult.priority, "P2");
  assert.equal(billingResult.signals.urgencyDetected, true);
  assert.equal(billingResult.signals.keywords.includes("refund"), true);

  const securityResult = analyzeTicket(
    "Urgent: we suspect unauthorized access and a security breach in production."
  );
  assert.equal(securityResult.category, "Technical");
  assert.equal(securityResult.priority, "P0");
  assert.equal(securityResult.signals.customRuleTriggered, true);
  assert.equal(securityResult.confidence > 0.7, true);

  const featureResult = analyzeTicket(
    "Please add a Slack integration and improve reporting exports."
  );
  assert.equal(featureResult.category, "Feature Request");
  assert.equal(featureResult.priority, "P3");

  await getDb();

  const invalidResponse = await request(app).post("/tickets/analyze").send({});
  assert.equal(invalidResponse.status, 400);

  const createResponse = await request(app)
    .post("/tickets/analyze")
    .send({ message: "The app is down and throwing an error for every user." });
  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.body.category, "Technical");

  const listResponse = await request(app).get("/tickets");
  assert.equal(listResponse.status, 200);
  assert.equal(Array.isArray(listResponse.body.tickets), true);
  assert.equal(typeof listResponse.body.tickets[0]?.message, "string");

  console.log("All backend tests passed.");
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
