import { Target, TargetModel } from './../../models/Target.model';
import express from 'express';
import { SnipeModel, SnipeTotal } from '../../models/Snipe.model';

const router = express.Router();


router.route("/").get(async (req, res) => {
    const date = new Date().getTime()
    const targets = await TargetModel.aggregate([
        { $match: { dateBegin: { $lte: date }, dateEnd: { $gt: date }} },
        { $lookup: { from: "players", localField: "targetId", foreignField: "id", as: "player" } },
        { $unwind: "$player" }
    ])

    const target: Target = targets.pop()
    const snipes = await SnipeModel.aggregate([
        { $match: { victim: target.targetId, time: { $lte: target.dateEnd, $gt: target.dateBegin } } },
        { $lookup: { from: "players", localField: "sniper", foreignField: "id", as: "sniper" } },
        { $unwind: "$sniper" }
    ])

    const temp = new Map<string, number>()
    for (const snipe of snipes) {
        const name = snipe.sniper.name??""
        temp.set(name, (temp.get(name)??0)+1)
    }

    const output: SnipeTotal[] = []
    for (const entry of temp.entries()) {
        const total: SnipeTotal = {
            name: entry[0],
            total: entry[1]
        }
        output.push(total)
    }
    
    res.json({ target, snipes: output })
})

export default router