import { scoresToDb } from './score';
import express from 'express';
import { CookieJar } from 'tough-cookie';
import { Beatmap, BeatmapModel } from '../../models/Beatmap.model';
import { Play } from '../../models/play';
import { Player, PlayerModel } from '../../models/Player.model';
import { Score, ScoreModel } from '../../models/Score.model';
import { updateBeatmap } from '../../shared/updatemap';
import { promisify } from 'util'
import { FormattedSnipe, SnipeModel } from '../../models/Snipe.model';
import { QueryData } from '../../models/query';
import hash from 'object-hash'
import fs from 'fs'
import schedule from 'node-schedule'

const router = express.Router();
let queryCount = 0;

export const convertToPlay = async (mapId: number, map?: Beatmap, score?: Score, player?: Player) => {
    if (!map) {
        const foundMap = await BeatmapModel.findOne({ id: mapId });
        if (foundMap) {
            map = foundMap;
        }
    }

    if (!score) {
        const foundScore = await ScoreModel.findOne({ beatmapId: mapId })
        if (foundScore) {
            score = foundScore;
        }
    }

    if (!player) {
        const foundPlayer = await PlayerModel.findOne({ id: score?.playerId });
        if (foundPlayer) {
            player = foundPlayer;
        }
    }

    const play: Play = { 
        id: score?.id??0,
        beatmapId: score?.beatmapId??0,
        artist: map?.artist??"Map",
        song: map?.song??"Not",
        mapper: map?.mapper??"Sorry",
        difficulty: map?.difficulty??"Found",
        pp: score?.pp??0,
        acc: score?.acc??0,
        mods: score?.mods??[],
        date: score?.date??"",
        score: score?.score??0,
        player: player?.name??"Player not found"
    }

    return play
}

let scoreCache: any[] = [];
export const loadData = async () => {
    const query = [
        { $lookup: { from: "players", localField: "playerId", foreignField: "id", as: "player" } },
        { $unwind: "$player" },
        { $lookup: { from: "beatmaps", localField: "beatmapId", foreignField: "id", as: "beatmap" } },
        { $unwind: "$beatmap" },
    ]
    scoreCache = await ScoreModel.aggregate(query, { maxTimeMS: 3600000 });

    schedule.scheduleJob('*/30 * * * *', async () => {
        scoreCache = await ScoreModel.aggregate(query);
    })
}

router.route("/loading/").get((req, res) => {
    if (scoreCache.length == 0) {
        res.send(true)
    } else {
        res.send(false)
    }
})

router.route("/query/").post(async (req, res) => {
    const query: QueryData = req.body.body.query 
    const pageNumber: number = req.body.body.pageNumber
    const pageSize: number = req.body.body.pageSize 
    const toExport: boolean = req.body.body.toExport
    const sortBy: string = req.body.body.sortBy
    const sortOrder: number = req.body.body.sortOrder === "desc" ? -1 : 1

    // copilot filled all this out dont blame me
    const scores = scoreCache.filter(score => { 
        if (query.artist && !score.beatmap.artist.toLowerCase().includes(query.artist.toLowerCase())) return false;
        if (query.title && !score.beatmap.song.toLowerCase().includes(query.title.toLowerCase())) return false;
        if (query.difficulty && !score.beatmap.difficulty.toLowerCase().includes(query.difficulty.toLowerCase())) return false;
        if (query.player && score.player.name.toLowerCase() != query.player.toLowerCase()) return false;
        if (query.modsInclude.length && !query.modsInclude.every(mod => score.mods.includes(mod))) return false;
        if (query.modsExclude.length && query.modsExclude.some(mod => score.mods.includes(mod))) return false;
        if (query.bpm.changedMin && score.beatmap.bpm < query.bpm.min) return false;
        if (query.bpm.changedMax && score.beatmap.bpm > query.bpm.max) return false;
        if (query.ar.changedMin && score.beatmap.ar < query.ar.min) return false;
        if (query.ar.changedMax && score.beatmap.ar > query.ar.max) return false;
        if (query.cs.changedMin && score.beatmap.cs < query.cs.min) return false;
        if (query.cs.changedMax && score.beatmap.cs > query.cs.max) return false;
        if (query.hp.changedMin && score.beatmap.hp < query.hp.min) return false;
        if (query.hp.changedMax && score.beatmap.hp > query.hp.max) return false;
        if (query.od.changedMin && score.beatmap.od < query.od.min) return false;
        if (query.od.changedMax && score.beatmap.od > query.od.max) return false;
        if (query.sr.changedMin && score.beatmap.sr < query.sr.min) return false;
        if (query.sr.changedMax && score.beatmap.sr > query.sr.max) return false;
        if (query.length.changedMin && score.beatmap.length < query.length.min) return false;
        if (query.length.changedMax && score.beatmap.length > query.length.max) return false;
        if (query.rankedMin && new Date(score.beatmap.rankedDate).getTime() < query.rankedMin) return false;
        if (query.rankedMax && new Date(score.beatmap.rankedDate).getTime() > query.rankedMax) return false;
        if (query.combo.changedMin && score.combo < query.combo.min) return false;
        if (query.combo.changedMax && score.combo > query.combo.max) return false;
        if (query.misses.changedMin && score.missCount < query.misses.min) return false;
        if (query.misses.changedMax && score.missCount > query.misses.max) return false;
        if (query.pp.changedMin && score.pp < query.pp.min) return false;
        if (query.pp.changedMax && score.pp > query.pp.max) return false;
        if (query.acc.changedMin && score.acc*100 < query.acc.min) return false;
        if (query.acc.changedMax && score.acc*100 > query.acc.max) return false;
        if (!query.noSpinners && score.beatmap.hasSpinner) return false;
        if (query.dateMin && new Date(score.date).getTime() < query.dateMin) return false;
        if (query.dateMax && new Date(score.date).getTime() > query.dateMax) return false;
        return true;
    })

    if (toExport) {
        const name = hash(query)
        const path = "./" + name + " .db"
        await scoresToDb(name, path, scores)
        res.download(path)
        fs.rm(path, () => {})
    } else {
        const numberResults = scores.length
        const hashes = scores.map(item => item.beatmap.hash)
        const page: Play[] = []
        const sorted = scores.sort((a, b) => {
            if (sortBy == "date") {
                a.date = new Date(a.date).getTime()
                b.date = new Date(b.date).getTime()
            }
            return sortOrder * (a[sortBy] - b[sortBy])
        })

        for (const score of sorted.slice(pageSize * (pageNumber - 1), pageSize * pageNumber)) {
            const play = await convertToPlay(score.beatmapId, score.beatmap, score, score.player)
            page.push(play)
        }
    
        res.send({ page, numberResults, hashes });
    }
})

router.route("/details/:id").get(async (req, res) => {
    const id = parseInt(req.params.id);
    const map = await BeatmapModel.findOne({ id });

    const activity = await SnipeModel.aggregate([
        { $match: { beatmap: id } },
        { $lookup: { localField: "victim", from: "players", foreignField: "id", as: "victimFull"}},
        { $lookup: { localField: "sniper", from: "players", foreignField: "id", as: "sniperFull"}},
        { $unwind: "$victimFull" },
        { $unwind: "$sniperFull" },
    ])

    const snipes: FormattedSnipe[] = []
    for (const snipe of activity) {
        const formatted: FormattedSnipe = {
            sniperId: snipe.sniper,
            victimId: snipe.victim,
            time: new Date(snipe.time).getTime(),
            sniper: snipe.sniperFull.name,
            victim: snipe.victimFull.name,
            beatmapId: id, 
            beatmap: ""
        }
        snipes.push(formatted)
    }

    
    if (map) {
        const play = await convertToPlay(id, map)
        res.json({ beatmap: map, activity: snipes, score: play })
    } else {
        res.json({ beatmap: map, activity: snipes })
    }
    
})

router.route("/numberLoaded").get(async (req, res) => {
    const number = await BeatmapModel.countDocuments();
    res.json(number);
})

router.route("/refresh/:id").post(async (req, res) => {
    const id = parseInt(req.params.id)
    const beatmap = await BeatmapModel.findOne({ id: id })

    if (beatmap) {
        const jar = new CookieJar();
        const setCookie = promisify(jar.setCookie.bind(jar))
        await setCookie(process.env.COOKIE??"", 'https://osu.ppy.sh')
        await updateBeatmap(id, jar, beatmap)
    }

    res.json()
})

router.route("/noScore").get(async (req, res) => {
    const pageNumber = parseInt(req.query.pageNumber as string)
    const pageSize = parseInt(req.query.pageSize as string)
    const beatmaps = await BeatmapModel.find({ playerId: undefined }).sort({sr: -1}).skip((pageNumber-1) * pageSize).limit(pageSize);
    res.json(beatmaps);
})


router.route("/noScoreCount").get(async (req, res) => {
    const number = await BeatmapModel.countDocuments({ playerId: undefined });
    res.json(number);
})

router.route("/random").get(async (req, res) => {
    const count = await ScoreModel.countDocuments()
    const random = Math.floor(Math.random() * count)
    const score = await ScoreModel.findOne().skip(random)
    if (score == null) {
        res.json(null)
        return
    }

    const play = await convertToPlay(score.beatmapId)
    res.json(play);
})

export default router