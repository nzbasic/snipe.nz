import express from 'express';
import { ScoreModel } from '../../models/Score.model'
import { PlayerModel } from '../../models/Player.model';
import { Play } from '../../models/play';
import { BeatmapModel } from '../../models/Beatmap.model';
import { FormattedSnipe, SnipeModel } from '../../models/Snipe.model';

const router = express.Router();

router.route("/latest/:number").get(async (req, res) => {
    const number = parseInt(req.params.number)
    const latest = await SnipeModel.find().sort({ time: -1 }).limit(number)
    const output: FormattedSnipe[] = []

    for (const snipe of latest) {
        const formattedSnipe = {} as FormattedSnipe
        const victimPromise = PlayerModel.findOne({ id: snipe.victim })
        const sniperPromise = PlayerModel.findOne({ id: snipe.sniper })
        const beatmapPromise = BeatmapModel.findOne({ id: snipe.beatmap })
        await Promise.all([
            victimPromise.then(item => formattedSnipe.victim = item?.name??""),
            sniperPromise.then(item => formattedSnipe.sniper = item?.name??""),
            beatmapPromise.then(item => formattedSnipe.beatmap = item?.song??"")
        ])
        output.push(formattedSnipe)
    }

    res.json(output)
})

export default router