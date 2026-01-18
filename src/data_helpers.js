const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const validateJsonRecords = (value) =>
  Array.isArray(value) && value.every(isPlainObject);

export const serializeJson = (data) => JSON.stringify(data, null, 2);

export const parseCsvLine = (line) => {
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

export const parseCsv = (text) => {
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

export const escapeCsv = (value) => {
  const stringValue = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const toCsv = (rows, columns) => {
  const headerLine = columns.map(escapeCsv).join(",");
  const bodyLines = rows.map((row) =>
    columns.map((column) => escapeCsv(row[column])).join(",")
  );
  return [headerLine, ...bodyLines].join("\n");
};
