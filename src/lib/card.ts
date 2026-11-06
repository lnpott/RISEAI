export type ParsedCard = {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  firstMes: string;
  creator: string;
  tags: string[];
  spec: string;
};

function readChunk(view: DataView, offset: number) {
  const length = view.getUint32(offset);
  const type = String.fromCharCode(
    view.getUint8(offset + 4),
    view.getUint8(offset + 5),
    view.getUint8(offset + 6),
    view.getUint8(offset + 7),
  );
  const dataStart = offset + 8;
  const dataEnd = dataStart + length;
  return { type, dataStart, dataEnd, next: dataEnd + 4 };
}

function latin1(bytes: Uint8Array) {
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

function pickString(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function normalize(raw: unknown): ParsedCard | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === "string")
    : [];
  const card: ParsedCard = {
    name: pickString(data, ["name"]) || "Sem nome",
    description: pickString(data, ["description"]),
    personality: pickString(data, ["personality"]),
    scenario: pickString(data, ["scenario"]),
    firstMes: pickString(data, ["first_mes", "firstMes"]),
    creator: pickString(data, ["creator"]),
    tags,
    spec: pickString(root, ["spec"]) || "legado",
  };
  if (!card.description && !card.firstMes && card.name === "Sem nome") return null;
  return card;
}

export async function parseCharacterFile(file: File): Promise<ParsedCard> {
  if (file.name.toLowerCase().endsWith(".json") || file.type === "application/json") {
    const parsed = normalize(JSON.parse(await file.text()));
    if (!parsed) throw new Error("JSON sem ficha de personagem.");
    return parsed;
  }

  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);
  if (bytes.length < 8 || latin1(bytes.slice(0, 8)) !== "\x89PNG\r\n\x1a\n") {
    throw new Error("Arquivo não é PNG nem JSON de card.");
  }

  let offset = 8;
  const texts: { key: string; value: string }[] = [];
  while (offset + 12 <= bytes.length) {
    const chunk = readChunk(view, offset);
    if (chunk.type === "tEXt" || chunk.type === "iTXt") {
      const slice = bytes.slice(chunk.dataStart, chunk.dataEnd);
      const raw = latin1(slice);
      const nul = raw.indexOf("\0");
      if (nul > 0) {
        texts.push({ key: raw.slice(0, nul), value: raw.slice(nul + 1) });
      }
    }
    if (chunk.type === "IEND") break;
    offset = chunk.next;
  }

  const preferred = ["ccv3", "chara"];
  for (const key of preferred) {
    const hit = texts.find((t) => t.key === key);
    if (!hit) continue;
    try {
      const json = JSON.parse(atob(hit.value.replace(/\s/g, "")));
      const card = normalize(json);
      if (card) {
        card.spec = key;
        return card;
      }
    } catch {
      /* try next chunk */
    }
  }
  throw new Error("PNG sem metadata de personagem (chara/ccv3). Screenshot não serve.");
}
