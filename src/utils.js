export const uuid = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
};

export const nowIso = () => new Date().toISOString();

export const debounce = (fn, delay = 250) => {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
};

export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export const showToast = (element, message) => {
  element.textContent = message;
  element.classList.remove("hidden");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    element.classList.add("hidden");
  }, 2400);
};

export const downloadFile = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const csvStringify = (rows) => {
  const escape = (value) => {
    const stringValue = value ?? "";
    const stringified = String(stringValue);
    if (/[,\n"]/u.test(stringified)) {
      return `"${stringified.replace(/"/gu, '""')}"`;
    }
    return stringified;
  };
  return rows.map((row) => row.map(escape).join(",")).join("\n");
};

export const csvParse = (text) => {
  const rows = [];
  let current = [];
  let value = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          value += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      value += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (char === ",") {
      current.push(value);
      value = "";
      i += 1;
      continue;
    }

    if (char === "\n") {
      current.push(value);
      rows.push(current);
      current = [];
      value = "";
      i += 1;
      continue;
    }

    if (char === "\r") {
      i += 1;
      continue;
    }

    value += char;
    i += 1;
  }

  current.push(value);
  rows.push(current);

  return rows.filter((row) => row.length > 1 || row[0] !== "");
};

export const estimateSize = (records) => {
  const json = JSON.stringify(records);
  return new Blob([json]).size;
};

export const humanFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / 1024 ** index).toFixed(1);
  return `${size} ${units[index]}`;
};

export const chunkedProcess = async (items, chunkSize, cb) => {
  let index = 0;
  while (index < items.length) {
    const slice = items.slice(index, index + chunkSize);
    await cb(slice, index);
    index += chunkSize;
    await new Promise((resolve) => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => resolve());
      } else {
        setTimeout(resolve, 16);
      }
    });
  }
};

export const uniqueTags = (records) => {
  const tagSet = new Set();
  records.forEach((record) => {
    record.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
};
