import { Schema, model } from 'mongoose';

export interface Id {
  id: number,
}

const schema = new Schema<Id>({
  id: Number,
});

export const IdModel = model<Id>('Ids', schema);