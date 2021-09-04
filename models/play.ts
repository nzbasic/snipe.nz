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