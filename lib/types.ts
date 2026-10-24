export type Level = "present" | "past" | "future";

export type Exercise = {
  prompt: string; // "I ____ bananas at the market."
  answer: string; // "buy"
  options: string[]; // ["buy", "buys", "buying"]
};

export type Snap = {
  id: string;
  imageDataUrl: string; // miniature compressée, pour le carnet
  objectEn: string;
  objectFr: string;
  ipa: string;
  sentences: { en: string; fr: string }[];
  exercises: Exercise[];
  level: Level;
  createdAt: number;
};

export type Progress = {
  xp: number;
  level: Level;
  snapsToday: number;
  lastSnapDate: string; // "2026-10-25"
  snaps: Snap[];
};

export type SnapResult = Omit<Snap, "id" | "imageDataUrl" | "createdAt">;
