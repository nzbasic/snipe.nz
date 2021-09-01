import { Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface Player {
  name: string,
  id: number,
  firstCount: number
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Player>({
    name: String,
    id: Number,
    firstCount: Number
});

// 3. Create a Model.
export const PlayerModel = model<Player>('Player', schema);