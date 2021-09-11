import { Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface User {
  discordId: string,
  osuId: string,
  ping: boolean
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<User>({
    discordId: String,
    osuId: String,
    ping: Boolean
});

// 3. Create a Model.
export const UserModel = model<User>('User', schema);