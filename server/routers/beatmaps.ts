import express from 'express';
import { BeatmapModel } from '../../models/Beatmap.model';

const router = express.Router();

router.route("/numberLoaded").get(async (req, res) => {
    const number = await BeatmapModel.countDocuments();
    res.json(number);
})

export default router