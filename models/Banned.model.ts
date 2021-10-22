import { Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface Banned {
  playerId: number,
  beatmapId: number,
  score: number,
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Banned>({
    playerId: Number,
    beatmapId: Number,
    score: Number,
});

// 3. Create a Model.
export const BannedModel = model<Banned>('Banned', schema);