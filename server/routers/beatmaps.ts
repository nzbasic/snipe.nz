import express from 'express';
import { BeatmapModel } from '../../models/Beatmap.model';

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

export default router