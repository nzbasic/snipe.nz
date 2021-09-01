import { Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface Score {
  playerId: number,
  beatmapId: number,
  score: number,
  acc: number,
  mods: number,
  date: number,
  pp: number,
  missCount: number,
  maxCombo: number
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Score>({
  playerId: Number,
  beatmapId: Number,
  score: Number,
  acc: Number,
  mods: Number,
  date: Number,
  pp: Number,
  missCount: Number,
  maxCombo: Number
});

// 3. Create a Model.
export const ScoreModel = model<Score>('Score', schema);