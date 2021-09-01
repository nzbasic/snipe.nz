import { Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface Beatmap {
  artist: string,
  song: string,
  difficulty: string,
  sr: number,
  setId: number,
  id: number,
  ar: number,
  od: number,
  bpm: number,
  cs: number,
  hp: number,
  rankedDate: string,
  drain: number,
  mapper: string,
  playerId: number
}

export interface CHBeatmap {
  artist: string,
  song: string,
  difficulty: string,
  sr: number,
  setId: number,
  id: number,
  ar: number,
  od: number,
  bpm: number,
  cs: number,
  hp: number,
  mapper: string
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Beatmap>({
    artist: String,
    song: String,
    difficulty: String,
    sr: Number,
    setId: Number,
    id: Number,
    ar: Number,
    od: Number,
    bpm: Number,
    cs: Number,
    hp: Number,
    rankedDate: String,
    drain: Number,
    mapper: String,
    playerId: Number,
});

// 3. Create a Model.
export const BeatmapModel = model<Beatmap>('Beatmap', schema);