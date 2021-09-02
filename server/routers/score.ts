import express from 'express';
import { ScoreModel } from '../../models/Score.model'
import { PlayerModel } from '../../models/Player.model';
import { Play } from '../../models/play';
import { BeatmapModel } from '../../models/Beatmap.model';

const router = express.Router();

router.route("/numberScores").get(async (req, res) => {
    const id = req.body.id;
    const numberScores = await ScoreModel.countDocuments({ playerId: id });
    res.json(numberScores);
})

router.route("/").get(async (req, res) => {
    const id = parseInt(req.query.id as string)
    const pageNumber = parseInt(req.query.pageNumber as string)
    const pageSize = parseInt(req.query.pageSize as string)
    const order = { pp: -1 }
    const page: Play[] = []

    const count = await ScoreModel.countDocuments({ playerId: id})
    const scores = await ScoreModel.find({ playerId: id }).sort(order).skip(pageSize * (pageNumber - 1)).limit(pageSize)
    for (const score of scores) {
        const map = await BeatmapModel.findOne({ id: score.beatmapId })
        const play: Play = { 
            id: score.id,
            beatmapId: score.beatmapId,
            artist: map?.artist??"Map",
            title: map?.song??"Not",
            mapper: map?.mapper??"Sorry",
            difficulty: map?.difficulty??"Found",
            pp: score.pp,
            acc: score.acc,
            mods: score.mods,
            date: score.date
        }
        page.push(play)
    }

    res.json({ plays: page, numberPlays: count })
})

export default router