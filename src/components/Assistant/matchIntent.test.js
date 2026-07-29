import { matchIntent, getReply } from "./matchIntent";
import { INTENTS, FALLBACK_ID } from "./knowledgeBase";

// The assistant's intent matcher is the only non-trivial, dependency-free
// piece of client logic — a fast, deterministic unit-test target. (Rendering
// full components in jsdom is blocked by ESM-only deps like Lenis, so we test
// the logic directly rather than the DOM.)

test("every intent has a well-formed reply", () => {
  expect(INTENTS.length).toBeGreaterThan(0);
  for (const intent of INTENTS) {
    expect(typeof intent.id).toBe("string");
    expect(intent.reply).toBeTruthy();
    expect(typeof intent.reply.text).toBe("string");
    expect(intent.reply.text.length).toBeGreaterThan(0);
  }
});

test("unrecognized input falls back to the fallback intent", () => {
  expect(matchIntent("zxcvb qwerty asdfg unknowable").id).toBe(FALLBACK_ID);
});

test("a specific question beats the fallback", () => {
  const intent = matchIntent("what tech is this site built with?");
  expect(intent.id).not.toBe(FALLBACK_ID);
});

test("getReply resolves to a reply object with text (no endpoint set)", async () => {
  const reply = await getReply("what are Harish's skills?");
  expect(reply).toBeTruthy();
  expect(typeof reply.text).toBe("string");
  expect(reply.text.length).toBeGreaterThan(0);
});
