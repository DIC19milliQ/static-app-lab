import { serializeJson, validateJsonRecords } from "./data_helpers.js";
import { csvParse, csvStringify, downloadFile, showToast } from "./utils.js";
import { normalizeRecord } from "./model.js";

export const initImportExport = ({
  getRecords,
  onReplace,
  onMerge,
  toastEl,
}) => {
  const exportJsonBtn = document.getElementById("export-json");
  const exportCsvBtn = document.getElementById("export-csv");
  const importFile = document.getElementById("import-file");
  const importMode = document.getElementById("import-mode");
  const previewBtn = document.getElementById("preview-import");
  const commitBtn = document.getElementById("commit-import");
  const previewText = document.getElementById("import-preview");

  let previewRecords = [];

  exportJsonBtn.addEventListener("click", () => {
    const data = serializeJson(getRecords());
    downloadFile("localdb-export.json", data, "application/json");
    showToast(toastEl, "Exported JSON");
  });

  exportCsvBtn.addEventListener("click", () => {
    const header = [
      "id",
      "title",
      "body",
      "tags",
      "status",
      "rating",
      "createdAt",
      "updatedAt",
    ];
    const rows = [header];
    getRecords().forEach((record) => {
      rows.push([
        record.id,
        record.title,
        record.body,
        record.tags.join(","),
        record.status,
        record.rating,
        record.createdAt,
        record.updatedAt,
      ]);
    });
    const csv = csvStringify(rows);
    downloadFile("localdb-export.csv", csv, "text/csv");
    showToast(toastEl, "Exported CSV");
  });

  const parseFile = async () => {
    const file = importFile.files?.[0];
    if (!file) {
      showToast(toastEl, "Select a file to import");
      return;
    }
    const text = await file.text();
    if (file.name.endsWith(".json")) {
      const data = JSON.parse(text);
      if (!validateJsonRecords(data)) {
        showToast(toastEl, "JSON should be an array of records");
        return;
      }
      previewRecords = data.map(normalizeRecord);
    } else {
      const rows = csvParse(text);
      const [header, ...bodyRows] = rows;
      const index = (name) => header.indexOf(name);
      previewRecords = bodyRows
        .map((row) => ({
          id: row[index("id")],
          title: row[index("title")],
          body: row[index("body")],
          tags: row[index("tags")],
          status: row[index("status")],
          rating: row[index("rating")],
          createdAt: row[index("createdAt")],
          updatedAt: row[index("updatedAt")],
        }))
        .map(normalizeRecord);
    }
    previewText.textContent = `Ready to import ${previewRecords.length} records.`;
    commitBtn.disabled = previewRecords.length === 0;
  };

  previewBtn.addEventListener("click", parseFile);

  commitBtn.addEventListener("click", async () => {
    if (previewRecords.length === 0) return;
    const mode = importMode.value;
    if (mode === "replace") {
      await onReplace(previewRecords);
      showToast(toastEl, "Imported and replaced all records");
    } else {
      await onMerge(previewRecords);
      showToast(toastEl, "Merged imported records");
    }
    previewRecords = [];
    previewText.textContent = "";
    commitBtn.disabled = true;
    importFile.value = "";
  });
};
