import express from 'express';
import { Player, PlayerModel } from '../../models/Player.model';
import { ScoreModel } from '../../models/Score.model';

const router = express.Router();

router.route("/numberPlayers").get(async (req, res) => {
    const numberPlayers = await PlayerModel.countDocuments();
    res.json(numberPlayers);
})

router.route("/:id").get(async (req, res) => {
    const id = parseInt(req.params.id as string)
    const player = await PlayerModel.findOne({ id });
    res.json(player);
})

router.route("/").get(async (req, res) => {
    const searchTerm = req.query.searchTerm as string
    const pageNumber = parseInt(req.query.pageNumber as string)
    const pageSize = parseInt(req.query.pageSize as string)
    const order = { firstCount: req.query.order }
    const regex = new RegExp(searchTerm, "i");
    const page = await PlayerModel.find({ name: { $regex: regex } }).sort(order).skip(pageSize * (pageNumber - 1)).limit(pageSize)
    const count = await PlayerModel.countDocuments({ name: { $regex: regex } })
    res.json({ players: page, numberPlayers: count })
})



export default router