import { convertToPlay } from './beatmaps';
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

const getSnipeStats = async (option: string) => {
    const sniped = await SnipeModel.aggregate([
        { 
            $group: {
                _id: option,
                count: { $sum: 1 }
            }
        },
        { 
            $lookup: {
                from: "players",
                localField: "_id",
                foreignField: "id",
                as: "player"
            }
        },
        { 
            $unwind: "$player"
        }
    ]).exec()

    return sniped.sort((a, b) => b.count - a.count)
}

let snipeCount = 0;
let snipedCache: any[] = [];
let sniperCache: any[] = [];

router.route("/topSniped").get(async (req, res) => {
    const isSniper = JSON.parse(req.query.isSniper as string)
    const pageNumber = parseInt(req.query.pageNumber as string)
    const pageSize = parseInt(req.query.pageSize as string)

    const localCount = await SnipeModel.countDocuments()
    if (snipeCount != localCount) {
        snipeCount = localCount
        snipedCache = await getSnipeStats("$victim")
        sniperCache = await getSnipeStats("$sniper")
    } 

    const page = (isSniper ? sniperCache : snipedCache).slice((pageNumber-1) * pageSize, (pageNumber) * pageSize)
    res.json({ page, number: isSniper ? sniperCache.length : snipedCache.length })
})

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

router.route("/sniped/:id").get(async (req, res) => {
    const id = parseInt(req.params.id)
    const pageNumber = parseInt(req.query.pageNumber as string)
    const pageSize = parseInt(req.query.pageSize as string)
    const playerAsSniper = JSON.parse(req.query.playerAsSniper as string)

    const options: any = { }
    if (playerAsSniper) {
        options.sniper = id
    } else {
        options.victim = id
    }

    const joinedResult = await SnipeModel.aggregate([
        { $match: options },
        {
            $lookup: {
                localField: playerAsSniper ? "victim" : "sniper",
                from: "players",
                foreignField: "id",
                as: "joinedPlayer"
            }
        }
    ])

    const temp = new Map<string, number>()
    for (const snipe of joinedResult) {
        const name = snipe.joinedPlayer[0]?.name??""
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

    const lowerBound = (pageNumber-1) * pageSize
    const upperBound = pageNumber * pageSize
    const page = output.sort((a, b) => b.total - a.total).slice(lowerBound, upperBound)

    res.json({ page, number: output.length })
})

router.route("/snipeData/:id").get(async (req, res) => {
    const id = parseInt(req.params.id)
    const enemyName = req.query.enemy as string
    const playerAsSniper = JSON.parse(req.query.playerAsSniper as string)
    const enemy = await PlayerModel.findOne({ name: enemyName })
    const dateEnd = parseInt(req.query.dateEnd as string)
    const dateBegin = parseInt(req.query.dateBegin as string)

    let player = enemy;
    if (playerAsSniper) {
        player = await PlayerModel.findOne({ id })
    }

    if (enemy) {
        const options: any = { 
            sniper: playerAsSniper ? id : enemy.id,
            victim: playerAsSniper ? enemy.id: id
        }

        if (dateEnd !== 0 && dateBegin !== 0) {
            options.time = { $lte: dateEnd, $gt: dateBegin }
        }

        const aggregation = [
            { $match: options },
            {
                $lookup: {
                    localField: "beatmap",
                    from: "beatmaps",
                    foreignField: "id",
                    as: "beatmapFull"
                }
            },
            { 
                $lookup: {
                    localField: "beatmap", 
                    from: "scores", 
                    foreignField: "beatmapId",
                    as: "score"
                }
            },
            { $unwind: "$beatmapFull" },
            { $unwind: "$score"},
            { $sort: { "time": -1 } },
        ]

        const snipes = await SnipeModel.aggregate(aggregation)

        const plays: Play[] = []
        for (const snipe of snipes) {
            if (player) {
                const play = await convertToPlay(snipe.beatmap, snipe.beatmapFull, snipe.score, player)
                play.date = snipe.time
                plays.push(play)
            }
        }

        res.json(plays)
        return;
    }

    res.json(false)
})

export default router