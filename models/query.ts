export interface QueryData {
    artist: string,
    title: string,
    difficulty: string,
    bpm: MinMaxData,
    ar: MinMaxData,
    cs: MinMaxData,
    hp: MinMaxData,
    od: MinMaxData,
    sr: MinMaxData,
    length: MinMaxData,
    rankedMin: number,
    rankedMax: number,
    player: string,
    combo: MinMaxData,
    misses: MinMaxData,
    pp: MinMaxData,
    acc: MinMaxData,
    dateMin: number,
    dateMax: number,
    modsInclude: string[],
    modsExclude: string[],
    noSpinners: boolean
}

export interface MinMaxData {
    min: number,
    max: number,
    changedMin: boolean,
    changedMax: boolean
}