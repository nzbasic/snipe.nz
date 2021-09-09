import express from 'express';
import { CookieJar } from 'tough-cookie';
import { Beatmap, BeatmapModel } from '../../models/Beatmap.model';
import { Play } from '../../models/play';
import { PlayerModel } from '../../models/Player.model';
import { ScoreModel } from '../../models/Score.model';
import { updateBeatmap } from '../../shared/updatemap';
import { promisify } from 'util'
import { FormattedSnipe, SnipeModel } from '../../models/Snipe.model';

const router = express.Router();

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
            sniper: snipe.victimFull.name,
            victim: snipe.sniperFull.name,
            beatmapId: id, 
            beatmap: ""
        }
        snipes.push(formatted)
    }

    const score = await ScoreModel.findOne({ beatmapId: id });
    const player = await PlayerModel.findOne({ id: score?.playerId })
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

    res.json({ beatmap: map, activity: snipes, score: play })
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

    const map = await BeatmapModel.findOne({ id: score.beatmapId })
    const player = await PlayerModel.findOne({ id: score.playerId })
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
    res.json(play);
})

export default router