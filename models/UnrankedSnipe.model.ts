import { Schema, model } from 'mongoose';

export interface UnrankedSnipe {
  sniper: number,
  victim: number,
  time: number
  beatmap: number
}

const schema = new Schema<UnrankedSnipe>({
    sniper: Number,
    victim: Number,
    time: Number,
    beatmap: Number
});

export const UnrankedSnipeModel = model<UnrankedSnipe>('UnrankedSnipe', schema);
