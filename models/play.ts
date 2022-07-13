import { Player } from './Player.model';
import { Score } from 'node-osu'
import { GetUserScoresFullBeatmapResponse } from '@nzbasic/osu-proxy-wrapper'

export interface Play {
    id: number,
    beatmapId: number,
    artist: string,
    song: string,
    mapper: string,
    difficulty: string,
    pp: number,
    acc: number,
    mods: string[],
    date: string,
    score: number,
    player: string
}

export interface DiscordScore {
    player: Player,
    score: GetUserScoresFullBeatmapResponse
}
