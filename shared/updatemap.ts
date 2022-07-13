import { DiscordScore } from './../models/play';
import { SnipeModel } from './../models/Snipe.model';
import { BeatmapModel } from './../models/Beatmap.model';
import { Beatmap, RootObject } from './../models/set'
import { ApiScore, ScoreModel } from './../models/Score.model';
import got, { HTTPError } from 'got'
import { CookieJar } from 'tough-cookie';
import { PlayerModel } from '../models/Player.model';
import { BannedModel } from '../models/Banned.model';
import jsdom from 'jsdom';
import { UnrankedScoreModel } from '../models/Unranked.model'
import { UnrankedSnipeModel } from '../models/UnrankedSnipe.model'
const { JSDOM } = jsdom

export const getNumberScores = async (id: number) => {
    return ScoreModel.countDocuments({ playerId: id });
}

const addBeatmap = async (beatmapData: Beatmap, beatmapSetData: RootObject, playerId?: number) => {
    const newBeatmap = new BeatmapModel({
        artist: beatmapSetData.artist,
        song: beatmapSetData.title,
        difficulty: beatmapData.version,
        sr: beatmapData.difficulty_rating,
        setId: beatmapSetData.id,
        id: beatmapData.id,
        ar: beatmapData.ar,
        od: beatmapData.accuracy,
        bpm: beatmapData.bpm,
        cs: beatmapData.cs,
        hp: beatmapData.drain,
        rankedDate: beatmapData.last_updated,
        drain: beatmapData.total_length,
        mapper: beatmapSetData.creator,
        playerId: playerId??null,
        hash: beatmapData.checksum,
        hasSpinner: beatmapData.count_spinners > 0,
        unranked: isUnranked(beatmapSetData),
        maxCombo: beatmapData.max_combo
    })

    await newBeatmap.save();
    return newBeatmap;
}

const getBeatmap = async (setData: RootObject, beatmapData: Beatmap) => {
    const oldBeatmap = await BeatmapModel.findOne({ id: beatmapData.id })
    if (oldBeatmap) {
        oldBeatmap.artist = setData.artist;
        oldBeatmap.song = setData.title;
        oldBeatmap.difficulty = beatmapData.version;
        oldBeatmap.sr = beatmapData.difficulty_rating;
        oldBeatmap.setId = setData.id;
        oldBeatmap.id = beatmapData.id;
        oldBeatmap.ar = beatmapData.ar;
        oldBeatmap.od = beatmapData.accuracy;
        oldBeatmap.bpm = setData.bpm;
        oldBeatmap.cs = beatmapData.cs;
        oldBeatmap.hp = beatmapData.drain;
        oldBeatmap.mapper = setData.creator;
        oldBeatmap.hasSpinner = beatmapData.count_spinners > 0
        oldBeatmap.hash = beatmapData.checksum
        oldBeatmap.unranked = isUnranked(setData)
        oldBeatmap.maxCombo = beatmapData.max_combo
        await oldBeatmap.save()
        return oldBeatmap
    } else {
        return await addBeatmap(beatmapData, setData)
    }
}

const getPlayer = async (id: number, name: string) => {
    let player = await PlayerModel.findOne({ id })
    if (!player) {
        player = await new PlayerModel({ id, name }).save()
    } else {
        player.name = name
        await player.save()
    }

    return player
}

const sleep = async (ms: number) => await new Promise(res => setTimeout(res, ms))

const getBeatmapData = async (id: number): Promise<RootObject | undefined> => {
    const beatmapDataUrl = "https://osu.ppy.sh/beatmaps/" + id
    const response = await got(beatmapDataUrl)
    const dom = new JSDOM(response.body)
    const data = dom.window.document.getElementById("json-beatmapset")
    if (data) {
        return JSON.parse(data.innerHTML)
    }

    return undefined;
}

const getScores = async (id: number, jar: CookieJar): Promise<ApiScore[] | undefined> => {
    const url = "https://osu.ppy.sh/beatmaps/" + id + "/scores?type=country&mode=osu"
    const response = await got(url, {cookieJar: jar, timeout: 5000}).catch(err => console.log((err as HTTPError).response.body))
    if (!response) return undefined
    const scores: ApiScore[] = JSON.parse(response.body??"[]").scores
    return scores
}

const isUnranked = (setData: RootObject) => setData.status === "graveyard" || setData.status === "wip" || setData.status === "pending"

export const updateBeatmap = async (id: number, jar: CookieJar, prev?: number, score?: DiscordScore) => {
    await sleep(2000)

    const setData = await getBeatmapData(id)
    if (!setData) return

    const beatmapData = setData.beatmaps.find(x => x.id === id)
    if (!beatmapData) return
    
    await sleep(2000) 

    const beatmapModel = await getBeatmap(setData, beatmapData)

    if (isUnranked(setData)) {
        if (!score) return
        const existing = await UnrankedScoreModel.find({ beatmapId: id })
        if (existing.some(x => {
            if (score.player.id !== x.playerId) return false
            const date1 = new Date(x.date).getTime()
            const date2 = new Date(score.score.created_at).getTime()
            
            return date1 === date2
        })) {
            return
        } 

        const unrankedScore = new UnrankedScoreModel({
            playerId: score.player.id,
            beatmapId: score.score.beatmap.id,
            score: score.score.score,
            acc: score.score.accuracy,
            mods: [...score.score.mods],
            date: score.score.created_at,
            missCount: score.score.statistics.count_miss,
            maxCombo: score.score.max_combo,
            rank: score.score.rank,
            count50: score.score.statistics.count_50,
            count100: score.score.statistics.count_100,
            count300: score.score.statistics.count_300,
        })

        await unrankedScore.save()

        if (existing.length === 0) {
            beatmapModel.playerId = score.player.id
            await beatmapModel.save()
            return score.player.id;
        } else {
            const best = existing.sort((a, b) => b.score - a.score)[0]
            if (best.score < unrankedScore.score) {
                if (best.playerId !== score.player.id) {
                    await new UnrankedSnipeModel({
                        beatmap: id,
                        sniper: score.player.id,
                        victim: best.playerId,
                        time: new Date(score.score.created_at).getTime()
                    }).save()
                }
                
                beatmapModel.playerId = score.player.id
                await beatmapModel.save()
                return { victim: best.playerId, sniper: score.player.id }
            }
            return
        }
    } else {
        const scores = await getScores(id, jar)
        if (!scores || scores.length < 1) {
            console.log("no scores found") 
            return 
        }
        const first = scores[0];

        const foundScore = await ScoreModel.findOne({ id: first.id })
        if (foundScore) {
            console.log("found matching score") 
            return
        }

        const player = await getPlayer(first.user_id, first.user.username)
        const existingScore = await ScoreModel.findOne({ beatmapId: id })

        if (!existingScore) {
            console.log("no existing score")
            await new ScoreModel({ 
                id: first.id,
                playerId: first.user_id,
                beatmapId: id,
                score: first.total_score,
                acc: first.accuracy,
                mods: first.mods.map(mod => mod.acronym),
                date: first.ended_at,
                pp: first.pp,
                missCount: first.statistics.miss??0,
                maxCombo: first.max_combo
            }).save()

            beatmapModel.playerId = player.id
            await beatmapModel.save()

            player.firstCount = await getNumberScores(player.id)
            await player.save()

            return first.user_id;
        }

        if (existingScore.score < first.total_score) {
            console.log("better score found")
            const snipedPlayer = await PlayerModel.findOne({ id: existingScore.playerId })

            if (existingScore.playerId !== player.id) {
                console.log("better score found different player")

                await new SnipeModel({
                    beatmap: id,
                    sniper: player.id,
                    victim: existingScore.playerId,
                    time: new Date(first.ended_at).getTime()
                }).save()

                beatmapModel.playerId = player.id    
                await beatmapModel.save()
            }

            await new ScoreModel({ 
                id: first.id,
                playerId: first.user_id,
                beatmapId: id,
                score: first.total_score,
                acc: first.accuracy,
                mods: first.mods.map(mod => mod.acronym),
                date: first.ended_at,
                pp: first.pp,
                missCount: first.statistics.miss??0,
                maxCombo: first.max_combo
            }).save()

            await existingScore.delete()

            player.firstCount = await getNumberScores(player.id)
            await player.save()

            if (snipedPlayer) {
                snipedPlayer.firstCount = await getNumberScores(snipedPlayer.id)
                await snipedPlayer.save()
            }

            if (existingScore.playerId != first.user_id) {
                return { victim: existingScore.playerId, sniper: first.user_id };
            } else {
                return { victim: existingScore.playerId, sniper: existingScore.playerId }
            }
        }
    }
}
