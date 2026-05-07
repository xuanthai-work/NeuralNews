import { readFile } from "fs/promises";
import path from "path";
import type { Data } from "../types";

const DATA_PATH = path.join(process.cwd(), "public", "data.json");

export async function getNewsData(): Promise<Data> {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as Data;
  } catch (err) {
    console.error("Failed to read data.json:", err);
    return {
      generated_at: new Date().toISOString(),
      total_stories: 0,
      sources: [],
      stories: [],
    };
  }
}
