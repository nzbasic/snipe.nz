export interface Play {
    id: number,
    beatmapId: number,
    artist: string,
    title: string,
    mapper: string,
    difficulty: string,
    pp: number,
    acc: number,
    mods: string[],
    date: string
}