import {
  isTranslatableText,
  keepsEnglish,
  collectTranslatable,
  applyTranslations,
  translateText,
  translateEntries,
  TranslationUnavailable,
} from "./translate";

// The auto-translation pipeline is pure logic around one fetch call, so it's
// unit-testable end to end with a stubbed provider. What matters most here is
// that i18next placeholders and <Trans> markers survive the round trip — a
// mangled marker would break the rendered markup, so the code must keep the
// English instead.

// A fake translator: uppercases the letters it's given and leaves everything
// else (sentinels, digits, punctuation) alone — the behaviour of a well-behaved
// engine. `mangle` simulates one that eats the sentinels.
function stubProvider({ mangle = false, fail = false } = {}) {
  global.fetch = jest.fn(async (url) => {
    if (fail) throw new Error("network down");
    const q = decodeURIComponent(String(url).split("&q=")[1] || "");
    const out = mangle ? q.replace(/\[\[\d+\]\]|#\d+#/g, "") : q;
    return {
      ok: true,
      json: async () => [[[out.toUpperCase(), q, null, null, 0]]],
    };
  });
}

beforeEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

describe("isTranslatableText", () => {
  test("skips values with nothing to translate", () => {
    expect(isTranslatableText("")).toBe(false);
    expect(isTranslatableText("   ")).toBe(false);
    expect(isTranslatableText("2017 – 2021")).toBe(false); // education period
    expect(isTranslatableText("©")).toBe(false);
    expect(isTranslatableText("you@example.com")).toBe(false); // email only
    expect(isTranslatableText("{{count}}")).toBe(false); // placeholder only
    expect(isTranslatableText("iOPEX")).toBe(false); // glossary term only
    expect(isTranslatableText(42)).toBe(false);
  });

  test("accepts real copy", () => {
    expect(isTranslatableText("Know who <1>I am</1>")).toBe(true);
    expect(isTranslatableText("{{count}} contributions in the last year")).toBe(true);
  });
});

test("proper-noun paths stay in English", () => {
  expect(keepsEnglish("education.items.be.institution")).toBe(true);
  expect(keepsEnglish("education.items.be.description")).toBe(false);
  expect(keepsEnglish("about.card.p1")).toBe(false);
});

describe("translateText", () => {
  test("preserves placeholders, markers and glossary terms", async () => {
    stubProvider();
    const out = await translateText(
      "Hi {{name}}, I'm <1>Harish Siva</1> at iOPEX Technologies",
      "ta"
    );
    expect(out).toContain("{{name}}");
    expect(out).toContain("<1>");
    expect(out).toContain("</1>");
    expect(out).toContain("Harish Siva"); // glossary: never transliterated
    expect(out).toContain("iOPEX Technologies");
    expect(out).toContain("HI"); // the surrounding copy did get translated
  });

  test("keeps English when the engine drops the markers", async () => {
    stubProvider({ mangle: true });
    expect(await translateText("Let me <1>introduce</1> myself", "hi")).toBeNull();
  });

  test("caches, so a repeat save costs no requests", async () => {
    stubProvider();
    await translateText("Where I studied", "hi");
    const calls = global.fetch.mock.calls.length;
    await translateText("Where I studied", "hi");
    expect(global.fetch.mock.calls.length).toBe(calls);
  });

  test("reports the service as unavailable once every provider is down", async () => {
    stubProvider({ fail: true });
    await expect(
      translateEntries([{ path: "a.b", value: "Hello there friend" }], "ta")
    ).rejects.toThrow(TranslationUnavailable);
  });
});

describe("collectTranslatable", () => {
  const en = {
    about: { heading: "Know who <1>I am</1>", eyebrow: "About me" },
    home: { roles: ["Software Engineer", "Full Stack Developer"] },
    education: { items: { be: { institution: "Panimalar", period: "2017 – 2021" } } },
  };

  test("only picks up what the owner actually changed", () => {
    const baseline = JSON.parse(JSON.stringify(en));
    const edited = { ...en, about: { ...en.about, eyebrow: "A bit about me" } };
    const paths = collectTranslatable(edited, {
      baseline,
      existing: { about: { heading: "…", eyebrow: "…" }, home: { roles: ["…", "…"] } },
    }).map((e) => e.path);
    expect(paths).toEqual(["about.eyebrow"]);
  });

  test("picks up keys the target language is missing", () => {
    const paths = collectTranslatable(en, {
      baseline: en,
      existing: { about: { heading: "जानिए" } },
    }).map((e) => e.path);
    expect(paths).toContain("about.eyebrow");
    expect(paths).toContain("home.roles");
    expect(paths).not.toContain("about.heading"); // unchanged and already translated
    expect(paths).not.toContain("education.items.be.institution"); // proper noun
    expect(paths).not.toContain("education.items.be.period"); // no letters
  });

  test("all:true rebuilds every translatable leaf", () => {
    const paths = collectTranslatable(en, { all: true }).map((e) => e.path);
    expect(paths).toEqual(["about.heading", "about.eyebrow", "home.roles"]);
  });
});

test("translateEntries + applyTranslations merge into the target tree", async () => {
  stubProvider();
  const entries = [
    { path: "about.eyebrow", value: "About me" },
    { path: "home.roles", value: ["Software Engineer"] },
  ];
  const { results, skipped } = await translateEntries(entries, "hi");
  expect(skipped).toEqual([]);
  const merged = applyTranslations({ about: { heading: "keep me" } }, results);
  expect(merged.about.heading).toBe("keep me"); // untouched keys survive
  expect(merged.about.eyebrow).toBe("ABOUT ME");
  expect(merged.home.roles).toEqual(["SOFTWARE ENGINEER"]);
});
