import { Play } from "../../../models/play";

export interface SearchResponse {
    numberPlayers: number;
    players: Player[];
}

export interface Player {
    firstCount: number;
    id: number;
    name: string;
}

export interface Snipe {
    beatmap: string;
    beatmapId: number;
    sniper: string;
    sniperId: number;
    time: number;
    victim: string;
    victimId: number;
}

export interface SnipeCountResponse {
    number: number;
    page: SnipeCount[];
}

export interface SnipeCount {
    count: number;
    player: Player;
}

export interface SearchParams {
    pageSize: number,
    pageNumber: number,
    order: number,
    searchTerm?: string
}

export interface Beatmap {
    ar: number;
    artist: string;
    bpm: number;
    cs: number;
    difficulty: string;
    drain: number;
    hasSpinner: boolean;
    hash: string;
    hp: number;
    id: number;
    mapper: string;
    od: number;
    playerId: number;
    rankedDate?: number;
    setId: number;
    song: string;
    sr: number;
}

export interface ContestedBeatmap {
    count: number;
    beatmap: Beatmap
}

export interface StatsResponse {
    beatmapCount: number;
    contested: ContestedBeatmap[];
    scoreCount: number;
    snipeCount: number;
    topSniperWeek: SnipeCount[];
    topVictimWeek: SnipeCount[]
}

export interface ScoresResponse {
    numberPlays: number;
    plays: Play[]
}
