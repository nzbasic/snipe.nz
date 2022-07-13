import { model, Schema } from "mongoose";

export interface UnrankedScore {
    playerId: number,
    beatmapId: number,
    score: number,
    acc: number,
    mods: string[],
    date: string,
    missCount: number,
    maxCombo: number,
    rank: string,
    count50: number,
    count100: number,
    count300: number,
}

const schema = new Schema<UnrankedScore>({
    playerId: Number,
    beatmapId: Number,
    score: Number,
    acc: Number,
    mods: Array,
    date: String,
    missCount: Number,
    maxCombo: Number,
    rank: String,
    count50: Number,
    count100: Number,
    count300: Number,
});
  
export const UnrankedScoreModel = model<UnrankedScore>('UnrankedScore', schema);
