import express from 'express';
import { BeatmapModel } from '../../models/Beatmap.model';
import { Play } from '../../models/play';
import { PlayerModel } from '../../models/Player.model';
import { ScoreModel } from '../../models/Score.model';

const router = express.Router();

router.route("/numberLoaded").get(async (req, res) => {
    const number = await BeatmapModel.countDocuments();
    res.json(number);
})

//todo
router.route("/refresh/:id").get(async (req, res) => {

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
    const count = await ScoreModel.countDocuments({})
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