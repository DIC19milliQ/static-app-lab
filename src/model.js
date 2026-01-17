import { nowIso, uuid } from "./utils.js";

const sampleTitles = [
  "Design sprint recap",
  "Market research notes",
  "Project atlas overview",
  "Weekly reflection",
  "Customer interview summary",
  "Reading highlights",
  "Q2 planning brief",
  "Feature backlog",
  "Idea vault",
  "Launch checklist",
];

const sampleBodies = [
  "Capture the key decisions and follow-ups before they fade.",
  "Insights on user behavior and a few unexpected patterns worth exploring.",
  "Outline the scope, milestones, and dependencies for the upcoming release.",
  "What went well, what could improve, and what to try next time.",
  "Summaries from user interviews with quotes and action items.",
  "A short synthesis of the latest articles and takeaways.",
];

const sampleTags = [
  "planning",
  "research",
  "design",
  "product",
  "personal",
  "work",
  "ops",
  "ideas",
  "writing",
  "analysis",
];

export const createRecord = (overrides = {}) => {
  const timestamp = nowIso();
  return {
    id: uuid(),
    title: "",
    body: "",
    tags: [],
    status: "active",
    rating: 3,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
};

export const normalizeRecord = (raw) => {
  const record = createRecord({
    id: raw.id || uuid(),
    title: String(raw.title || ""),
    body: String(raw.body || ""),
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : String(raw.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
    status: raw.status === "archived" ? "archived" : "active",
    rating: Number(raw.rating ?? 0),
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  });
  return record;
};

export const validateRecord = (record) => {
  if (!record.title || !record.title.trim()) {
    return "Title is required.";
  }
  return null;
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const generateSampleRecords = (count) => {
  const records = [];
  for (let i = 0; i < count; i += 1) {
    const title = `${pickRandom(sampleTitles)} #${i + 1}`;
    const body = pickRandom(sampleBodies);
    const tags = Array.from({ length: 2 + (i % 3) }, () => pickRandom(sampleTags));
    const createdAt = new Date(Date.now() - Math.random() * 1e10).toISOString();
    const updatedAt = new Date(Date.parse(createdAt) + Math.random() * 1e9).toISOString();
    records.push(
      createRecord({
        title,
        body,
        tags: Array.from(new Set(tags)),
        status: Math.random() > 0.2 ? "active" : "archived",
        rating: Math.floor(Math.random() * 6),
        createdAt,
        updatedAt,
      })
    );
  }
  return records;
};
