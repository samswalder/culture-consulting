export interface BlobDef {
  id: string;
  /** Pastel color with transparency */
  color: string;
  /** Solid version for lines/arrows */
  colorSolid: string;
  /** Position as percentage of container */
  x: number;
  y: number;
  /** Radius in pixels */
  size: number;
  /** Organic border-radius to make it blobby */
  borderRadius: string;
  /** Chord name from synthEngine (e.g. "EbMaj", "DMaj7") */
  chord: string;
  /** Placeholder — Samuel will provide actual audio files */
  audioSrc: string;
}

export const blobs: BlobDef[] = [
  {
    id: "a",
    color: "rgba(180, 130, 255, 0.30)",
    colorSolid: "rgba(180, 130, 255, 0.7)",
    x: 25,
    y: 12,
    size: 65,
    borderRadius: "62% 38% 46% 54% / 60% 44% 56% 40%",
    chord: "EbMaj",
    audioSrc: "/audio/blob-a.mp3",
  },
  {
    id: "b",
    color: "rgba(255, 160, 140, 0.30)",
    colorSolid: "rgba(255, 160, 140, 0.7)",
    x: 65,
    y: 22,
    size: 58,
    borderRadius: "44% 56% 63% 37% / 55% 38% 62% 45%",
    chord: "DMaj",
    audioSrc: "/audio/blob-b.mp3",
  },
  {
    id: "c",
    color: "rgba(130, 210, 180, 0.30)",
    colorSolid: "rgba(130, 210, 180, 0.7)",
    x: 40,
    y: 38,
    size: 70,
    borderRadius: "55% 45% 38% 62% / 42% 58% 42% 58%",
    chord: "FMaj",
    audioSrc: "/audio/blob-c.mp3",
  },
  {
    id: "d",
    color: "rgba(255, 200, 100, 0.30)",
    colorSolid: "rgba(255, 200, 100, 0.7)",
    x: 75,
    y: 50,
    size: 60,
    borderRadius: "48% 52% 58% 42% / 62% 40% 60% 38%",
    chord: "DMaj7",
    audioSrc: "/audio/blob-d.mp3",
  },
  {
    id: "e",
    color: "rgba(140, 180, 255, 0.30)",
    colorSolid: "rgba(140, 180, 255, 0.7)",
    x: 20,
    y: 62,
    size: 63,
    borderRadius: "58% 42% 50% 50% / 45% 55% 45% 55%",
    chord: "FMaj7",
    audioSrc: "/audio/blob-e.mp3",
  },
  {
    id: "f",
    color: "rgba(255, 150, 200, 0.30)",
    colorSolid: "rgba(255, 150, 200, 0.7)",
    x: 55,
    y: 75,
    size: 55,
    borderRadius: "42% 58% 45% 55% / 58% 42% 55% 45%",
    chord: "Gmin",
    audioSrc: "/audio/blob-f.mp3",
  },
];
