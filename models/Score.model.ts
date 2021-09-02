import { Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface Score {
  id: number,
  playerId: number,
  beatmapId: number,
  score: number,
  acc: number,
  mods: string[],
  date: string,
  pp: number,
  missCount: number,
  maxCombo: number
}

export interface ApiScore {
    id: number,
    user_id: number,
    accuracy: number,
    mods: string[],
    score: number,
    max_combo: number,
    passed: boolean,
    perfect: boolean,
    statistics: {
        count_50: number,
        count_100: number,
        count_300: number,
        count_miss: number,
        count_katu: number,
        count_geki: number,
    },
    rank: string,
    created_at: string,
    best_id: number,
    pp: number,
    mode: string,
    mode_int: number,
    replay: boolean,
    beatmap: {
        beatmapset_id: number,
        difficulty_rating: number,
        id: number,
        mode: string,
        status: string,
        total_length: number,
        user_id: number,
        version: string,
        accuracy: number,
        ar: number,
        bpm: number,
        convert: boolean,
        count_circles: number,
        count_sliders: number,
        count_spinners: number,
        cs: number,
        deleted_at: any
        drain: number,
        hit_length: number,
        is_scoreable: boolean,
        last_updated: string,
        mode_int: number,
        passcount: number,
        playcount: number,
        ranked: number,
        url: string,
        checksum: string
    },
    user: {
        avatar_url: string,
        country_code: string,
        default_group: string,
        id: number,
        is_active: boolean,
        is_bot: boolean,
        is_deleted: boolean,
        is_online: boolean,
        is_supporter: boolean,
        last_visit: string,
        pm_friends_only: boolean,
        profile_color: any,
        username: string,
        country: {
            code: string,
            name: string
        },
        cover: {
            custom_url: any,
            url: string
            id: string
        }
    }
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Score>({
  id: Number,
  playerId: Number,
  beatmapId: Number,
  score: Number,
  acc: Number,
  mods: Array,
  date: String,
  pp: Number,
  missCount: Number,
  maxCombo: Number
});

// 3. Create a Model.
export const ScoreModel = model<Score>('Score', schema);