import {
  bulkUpsert,
  clearAll,
  deleteRecord,
  getAllRecords,
  upsertRecord,
} from "./src/db.js";
import { createRecord, normalizeRecord } from "./src/model.js";
import { initTabs, confirmAction } from "./src/ui.js";
import { initList } from "./src/list.js";
import { initEditor } from "./src/editor.js";
import { updateDashboard } from "./src/dashboard.js";
import { initSettings } from "./src/settings.js";
import { initImportExport } from "./src/import_export.js";
import { nowIso, showToast, uniqueTags } from "./src/utils.js";

const toastEl = document.getElementById("toast");

const state = {
  records: [],
  selectedId: null,
  filters: {
    search: "",
    status: "all",
    tag: "",
    rating: 0,
    sort: "updated-desc",
  },
  autosave: false,
};

const applyFilters = () => {
  const search = state.filters.search.trim().toLowerCase();
  const filtered = state.records.filter((record) => {
    if (state.filters.status !== "all" && record.status !== state.filters.status) {
      return false;
    }
    if (state.filters.tag && !record.tags.includes(state.filters.tag)) {
      return false;
    }
    if (record.rating < state.filters.rating) {
      return false;
    }
    if (search) {
      const haystack = `${record.title} ${record.body}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (state.filters.sort) {
      case "updated-asc":
        return a.updatedAt.localeCompare(b.updatedAt);
      case "updated-desc":
        return b.updatedAt.localeCompare(a.updatedAt);
      case "created-asc":
        return a.createdAt.localeCompare(b.createdAt);
      case "created-desc":
        return b.createdAt.localeCompare(a.createdAt);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "title-asc":
      default:
        return a.title.localeCompare(b.title);
    }
  });

  return sorted;
};

const refreshUI = () => {
  const filtered = applyFilters();
  listView.update({
    records: filtered,
    selectedId: state.selectedId,
    tags: uniqueTags(state.records),
  });
  updateDashboard(state.records);
  settingsView.refresh();
};

const setRecords = (records) => {
  state.records = records.map(normalizeRecord);
  if (state.selectedId && !state.records.find((record) => record.id === state.selectedId)) {
    state.selectedId = null;
  }
  refreshUI();
};

const upsertLocalRecord = async (record) => {
  const now = nowIso();
  const existing = state.records.find((item) => item.id === record.id);
  const normalized = normalizeRecord({
    ...record,
    createdAt: existing?.createdAt || record.createdAt || now,
    updatedAt: now,
  });

  await upsertRecord(normalized);
  const next = existing
    ? state.records.map((item) => (item.id === normalized.id ? normalized : item))
    : [normalized, ...state.records];
  setRecords(next);
  state.selectedId = normalized.id;
};

const listView = initList({
  onSelect: (id) => {
    state.selectedId = id;
    refreshUI();
  },
  onEdit: (id) => {
    const record = state.records.find((item) => item.id === id);
    editorView.setRecord(record);
    document.querySelector('[data-tab="editor"]').click();
  },
  onDuplicate: async (id) => {
    const record = state.records.find((item) => item.id === id);
    if (!record) return;
    const duplicate = createRecord({
      title: `${record.title} (copy)`,
      body: record.body,
      tags: record.tags,
      status: record.status,
      rating: record.rating,
    });
    await upsertLocalRecord(duplicate);
    showToast(toastEl, "Duplicated record");
  },
  onArchiveToggle: async (id) => {
    const record = state.records.find((item) => item.id === id);
    if (!record) return;
    const nextStatus = record.status === "archived" ? "active" : "archived";
    await upsertLocalRecord({ ...record, status: nextStatus });
    showToast(toastEl, `Record ${nextStatus}`);
  },
  onDelete: async (id) => {
    if (!confirmAction("Delete this record? This cannot be undone.")) return;
    await deleteRecord(id);
    setRecords(state.records.filter((record) => record.id !== id));
    showToast(toastEl, "Record deleted");
  },
  onNew: () => {
    editorView.setRecord(createRecord());
    document.querySelector('[data-tab="editor"]').click();
  },
  onFilterChange: (filters) => {
    state.filters = { ...state.filters, ...filters };
    refreshUI();
  },
});

const editorView = initEditor({
  onSave: (record) => upsertLocalRecord(record),
  toastEl,
  onChangeAutosave: (value) => {
    state.autosave = value;
  },
});

const importExportView = initImportExport({
  getRecords: () => state.records,
  onReplace: async (records) => {
    await clearAll();
    await bulkUpsert(records);
    setRecords(records);
  },
  onMerge: async (records) => {
    await bulkUpsert(records);
    const merged = [...records, ...state.records.filter((item) => !records.find((r) => r.id === item.id))];
    setRecords(merged);
  },
  toastEl,
});

const settingsView = initSettings({
  getRecords: () => state.records,
  onClear: async () => {
    if (!confirmAction("Clear all data? This cannot be undone.")) return;
    await clearAll();
    setRecords([]);
    showToast(toastEl, "All data cleared");
  },
  onReset: async () => {
    if (!confirmAction("Reset demo? This will clear data and generate 100 records.")) return;
    await clearAll();
    const records = [];
    await bulkUpsert(records);
    setRecords([]);
    showToast(toastEl, "Demo reset");
    document.getElementById("generate-100").click();
  },
  onGenerate: async (records) => {
    await bulkUpsert(records);
    setRecords([...records, ...state.records]);
  },
  toastEl,
  getPwaStatus: () => {
    const registered = Boolean(navigator.serviceWorker?.controller);
    let displayMode = "browser";
    if (window.matchMedia("(display-mode: standalone)").matches) {
      displayMode = "standalone";
    }
    return { registered, displayMode };
  },
});

initTabs();

const loadData = async () => {
  const records = await getAllRecords();
  setRecords(records);
  editorView.setRecord(createRecord());
};

const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.register("./pwa/sw.js");
  if (registration.waiting) {
    showUpdateBanner(registration);
  }
  registration.addEventListener("updatefound", () => {
    const newWorker = registration.installing;
    if (!newWorker) return;
    newWorker.addEventListener("statechange", () => {
      if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
        showUpdateBanner(registration);
      }
    });
  });
};

const showUpdateBanner = (registration) => {
  const banner = document.getElementById("sw-update");
  const reloadBtn = document.getElementById("sw-reload");
  banner.classList.remove("hidden");
  reloadBtn.onclick = () => {
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
  };
};

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

await loadData();
await registerServiceWorker();
refreshUI();
