/**
 * Minimal CSV parser (RFC4180-ish) supporting:
 * - commas
 * - quoted fields with escaped quotes ("")
 * - newlines inside quoted fields
 * - CRLF / LF
 *
 * Returns: { headers: string[], rows: Record<string,string>[], fieldOrder: string[] }
 */
export function parseCsv(text) {
  const input = String(text ?? "").replace(/^\uFEFF/, ""); // strip BOM

  const records = [];
  let record = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  const pushField = () => {
    record.push(field);
    field = "";
  };
  const pushRecord = () => {
    // Ignore completely empty trailing record
    if (record.length === 1 && record[0] === "" && records.length === 0) return;
    records.push(record);
    record = [];
  };

  while (i < input.length) {
    const c = input[i];

    if (inQuotes) {
      if (c === '"') {
        const next = input[i + 1];
        if (next === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (c === ",") {
      pushField();
      i += 1;
      continue;
    }

    if (c === "\r") {
      // CRLF or CR
      pushField();
      pushRecord();
      if (input[i + 1] === "\n") i += 2;
      else i += 1;
      continue;
    }

    if (c === "\n") {
      pushField();
      pushRecord();
      i += 1;
      continue;
    }

    field += c;
    i += 1;
  }

  // Flush final field/record
  pushField();
  if (record.some((v) => String(v ?? "").trim() !== "")) pushRecord();

  if (inQuotes) {
    throw new Error("CSV parse error: unterminated quoted field");
  }

  if (records.length === 0) {
    return { headers: [], fieldOrder: [], rows: [] };
  }

  const rawHeaders = records[0].map((h) => String(h ?? "").trim());
  const headers = rawHeaders.filter((h) => h.length > 0);
  const fieldOrder = rawHeaders;

  const rows = [];
  for (let r = 1; r < records.length; r++) {
    const row = records[r];
    // Skip empty lines
    if (row.every((v) => String(v ?? "").trim() === "")) continue;
    const obj = {};
    for (let c = 0; c < rawHeaders.length; c++) {
      const key = rawHeaders[c];
      if (!key) continue;
      obj[key] = row[c] === undefined ? "" : String(row[c]);
    }
    rows.push(obj);
  }

  return { headers, fieldOrder, rows };
}

