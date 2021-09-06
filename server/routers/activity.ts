import express from 'express';
import { ScoreModel } from '../../models/Score.model'
import { PlayerModel } from '../../models/Player.model';
import { Play } from '../../models/play';
import { BeatmapModel } from '../../models/Beatmap.model';
import { FormattedSnipe, Snipe, SnipeModel, SnipeTotal } from '../../models/Snipe.model';

const router = express.Router();

const formatSnipes = async (snipes: Snipe[]) => {
    const output: FormattedSnipe[] = []

    for (const snipe of snipes) {
        const formattedSnipe = {} as FormattedSnipe
        formattedSnipe.time = snipe.time
        formattedSnipe.beatmapId = snipe.beatmap
        formattedSnipe.victimId = snipe.victim
        formattedSnipe.sniperId = snipe.sniper
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

    return output
}

// const getAllUserActivity = async (id: number, time=9999) => {
//     const victim = await SnipeModel.find({ victim: id })
//     const sniper = await SnipeModel.find({ sniper: id })
//     return victim.concat(sniper)
// }

router.route("/latest/:number").get(async (req, res) => {
    const number = parseInt(req.params.number)
    const latest = await SnipeModel.find().sort({ time: -1 }).limit(number)
    const output = await formatSnipes(latest)
    res.json(output)
})

router.route("/latestId/:id").get(async (req, res) => {
    const id = parseInt(req.params.id)
    const pageNumber = parseInt(req.query.pageNumber as string)
    const pageSize = parseInt(req.query.pageSize as string)
    const option = parseInt(req.query.option as string)
    const playerId = parseInt(req.query.playerId as string)
    const time = new Date().getTime() - (option * 86400 * 1000)

    const or = [{ victim: id }, { sniper: id }]
    if (playerId) {
        or[0].sniper = playerId
        or[1].victim = playerId
    }

    const total = await SnipeModel.find({ $or: or, time: { $gt: time }}).sort({ time: -1 }).skip((pageNumber-1) * pageSize).limit(pageSize)
    const count = await SnipeModel.countDocuments({ $or: [ { victim: id }, { sniper: id }], time: { $gt: time }})
    const output = await formatSnipes(total)
    res.json({ page: output, number: count })
})

router.route("/:id").get(async (req, res) => {
    const id = parseInt(req.params.id)
    const output = await SnipeModel.find().or([{ victim: id }, { sniper: id }]).sort({ time: -1 })
    res.json(output)
})

router.route("/snipedBy/:id").get(async (req, res) => {
    const id = parseInt(req.params.id)
    const snipedBy = await SnipeModel.find({ victim: id })
    const temp = new Map<number, number>()
    for (const snipe of snipedBy) {
        temp.set(snipe.sniper, (temp.get(snipe.sniper)??0)+1)
    }

    const output: SnipeTotal[] = []
    for (const entry of temp.entries()) {
        const name = (await PlayerModel.findOne({ id: entry[0] }))?.name??""
        const total: SnipeTotal = {
            name: name,
            total: entry[1]
        }
        output.push(total)
    }

    res.json(output)
})

router.route("/sniped/:id").get(async (req, res) => {
    const id = parseInt(req.params.id)
    const sniped = await SnipeModel.find({ sniper: id })
    const temp = new Map<number, number>()
    for (const snipe of sniped) {
        temp.set(snipe.victim, (temp.get(snipe.victim)??0)+1)
    }

    const output: SnipeTotal[] = []
    for (const entry of temp.entries()) {
        const name = (await PlayerModel.findOne({ id: entry[0] }))?.name??""
        const total: SnipeTotal = {
            name: name,
            total: entry[1]
        }
        output.push(total)
    }

    res.json(output)
})

export default router