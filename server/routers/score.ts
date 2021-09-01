import express from 'express';
import { ScoreModel } from '../../models/Score.model'
import { PlayerModel } from '../../models/Player.model';

const router = express.Router();

router.route("/numberScores").get(async (req, res) => {
    const id = req.body.id;
    const numberScores = await ScoreModel.countDocuments({ playerId: id });
    res.json(numberScores);
})

router.route("/").get(async (req, res) => {
    const id = req.body.id
    const pageNumber = req.body.pageNumber
    const pageSize = req.body.pageSize
    const order = { pp: -1 }
    const page = await ScoreModel.find({ playerId: id }).sort(order).skip(pageSize * (pageNumber - 1)).limit(pageSize)
    res.json(page)
})

export default router