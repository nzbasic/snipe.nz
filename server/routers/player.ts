import express from 'express';
import { PlayerModel } from '../../models/Player.model';

const router = express.Router();

router.route("/numberPlayers").get(async (req, res) => {
    const numberPlayers = await PlayerModel.countDocuments();
    res.json(numberPlayers);
})

router.route("/").get(async (req, res) => {
    const searchTerm = req.body.searchTerm??""
    const pageNumber = req.body.pageNumber
    const pageSize = req.body.pageSize
    const order = { firstCount: req.body.order }
    const regex = new RegExp(searchTerm, "i");
    const page = await PlayerModel.find({ name: { $regex: regex } }).sort(order).skip(pageSize * (pageNumber - 1)).limit(pageSize)
    res.json(page)
})

export default router