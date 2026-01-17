const parseCsvLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
};

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
};

const escapeCsv = (value) => {
  const stringValue = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const toCsv = (rows, columns) => {
  const headerLine = columns.map(escapeCsv).join(",");
  const bodyLines = rows.map((row) =>
    columns.map((column) => escapeCsv(row[column])).join(",")
  );
  return [headerLine, ...bodyLines].join("\n");
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const initDataViewer = () => {
  const dropzone = document.getElementById("data-dropzone");
  const fileInput = document.getElementById("data-file");
  const columnsContainer = document.getElementById("data-columns");
  const rowCount = document.getElementById("data-row-count");
  const filterInput = document.getElementById("data-filter");
  const table = document.getElementById("data-table");
  const tableHead = table.querySelector("thead");
  const tableBody = table.querySelector("tbody");
  const emptyMessage = document.getElementById("data-empty");
  const exportJson = document.getElementById("data-export-json");
  const exportCsv = document.getElementById("data-export-csv");

  const state = {
    rows: [],
    columns: [],
    visibleColumns: new Set(),
    sort: { key: null, dir: "asc" },
    filter: "",
  };

  const setRows = (rows) => {
    state.rows = rows;
    state.columns = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row || {}).forEach((key) => set.add(key));
        return set;
      }, new Set())
    );
    state.visibleColumns = new Set(state.columns);
    state.sort = { key: null, dir: "asc" };
    renderColumnToggles();
    renderTable();
  };

  const getViewRows = () => {
    const filterText = state.filter.trim().toLowerCase();
    const visibleColumns = Array.from(state.visibleColumns);
    const filtered = state.rows.filter((row) => {
      if (!filterText) return true;
      return visibleColumns.some((column) => String(row[column] ?? "").toLowerCase().includes(filterText));
    });
    if (!state.sort.key) return filtered;
    const sorted = [...filtered].sort((a, b) => {
      const left = String(a[state.sort.key] ?? "");
      const right = String(b[state.sort.key] ?? "");
      if (state.sort.dir === "asc") {
        return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
      }
      return right.localeCompare(left, undefined, { numeric: true, sensitivity: "base" });
    });
    return sorted;
  };

  const renderColumnToggles = () => {
    columnsContainer.innerHTML = "";
    state.columns.forEach((column) => {
      const label = document.createElement("label");
      label.className = "checkbox";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = state.visibleColumns.has(column);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          state.visibleColumns.add(column);
        } else {
          state.visibleColumns.delete(column);
        }
        renderTable();
      });
      const span = document.createElement("span");
      span.textContent = column;
      label.appendChild(checkbox);
      label.appendChild(span);
      columnsContainer.appendChild(label);
    });
  };

  const renderTable = () => {
    const visibleColumns = Array.from(state.visibleColumns);
    const viewRows = getViewRows();

    rowCount.textContent = `Rows: ${viewRows.length} / ${state.rows.length}`;

    if (state.rows.length === 0) {
      emptyMessage.textContent = "Load a CSV or JSON file to preview the data.";
    } else if (viewRows.length === 0) {
      emptyMessage.textContent = "No matching rows. Try another keyword or column selection.";
    } else {
      emptyMessage.textContent = "";
    }

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    if (visibleColumns.length === 0) return;

    const headerRow = document.createElement("tr");
    visibleColumns.forEach((column) => {
      const th = document.createElement("th");
      const label = document.createElement("button");
      label.type = "button";
      label.className = "table-sort";
      const isActive = state.sort.key === column;
      const direction = isActive ? (state.sort.dir === "asc" ? "▲" : "▼") : "";
      label.textContent = direction ? `${column} ${direction}` : column;
      label.addEventListener("click", () => {
        if (state.sort.key === column) {
          state.sort.dir = state.sort.dir === "asc" ? "desc" : "asc";
        } else {
          state.sort.key = column;
          state.sort.dir = "asc";
        }
        renderTable();
      });
      th.appendChild(label);
      headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    viewRows.forEach((row) => {
      const tr = document.createElement("tr");
      visibleColumns.forEach((column) => {
        const td = document.createElement("td");
        td.textContent = row[column] ?? "";
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  };

  const handleFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    let rows = [];
    if (file.name.endsWith(".json")) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          rows = parsed;
        }
      } catch {
        rows = [];
      }
    } else if (file.name.endsWith(".csv")) {
      rows = parseCsv(text);
    }
    setRows(rows);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
    const [file] = event.dataTransfer.files;
    if (file) {
      fileInput.value = "";
      handleFile(file);
    }
  };

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", handleDrop);

  fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    handleFile(file);
  });

  filterInput.addEventListener("input", () => {
    state.filter = filterInput.value;
    renderTable();
  });

  exportJson.addEventListener("click", () => {
    const visibleColumns = Array.from(state.visibleColumns);
    const data = getViewRows().map((row) => {
      if (visibleColumns.length === 0) return {};
      return visibleColumns.reduce((acc, column) => {
        acc[column] = row[column];
        return acc;
      }, {});
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    downloadBlob(blob, "data-view.json");
  });

  exportCsv.addEventListener("click", () => {
    const visibleColumns = Array.from(state.visibleColumns);
    const csv = toCsv(getViewRows(), visibleColumns);
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, "data-view.csv");
  });

  renderTable();
};
