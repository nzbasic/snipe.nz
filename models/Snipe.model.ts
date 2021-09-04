import { Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface Snipe {
  sniper: number,
  victim: number,
  time: number
  beatmap: number
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Snipe>({
    sniper: Number,
    victim: Number,
    time: Number,
    beatmap: Number
});

// 3. Create a Model.
export const SnipeModel = model<Snipe>('Snipe', schema);