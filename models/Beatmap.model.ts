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
  rankedDate: number,
  submittedDate: number,
  loved: boolean,
  length: number,
  genre: string,
  language: string,
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
    rankedDate: Number,
    submittedDate: Number,
    loved: Boolean,
    length: Number,
    genre: String,
    language: String,
    mapper: String,
});

// 3. Create a Model.
export const BeatmapModel = model<Beatmap>('Beatmap', schema);