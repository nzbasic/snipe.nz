import express from 'express';
import { Player, PlayerModel } from '../../models/Player.model';
import { ScoreModel } from '../../models/Score.model';
import osu from 'node-osu'
import { Beatmap, BeatmapModel } from '../../models/Beatmap.model';
import { getCookieJar } from '../../shared/jar';
import { updateBeatmap } from '../../shared/updatemap';
import { getNumberScores } from './score';

let osuApi: osu.Api
const router = express.Router();

router.route("/numberPlayers").get(async (req, res) => {
    const numberPlayers = await PlayerModel.countDocuments();
    res.json(numberPlayers);
})

router.route("/:id").get(async (req, res) => {
    const id = parseInt(req.params.id as string)
    const player = await PlayerModel.findOne({ id });
    if (player) {
        player.firstCount = await getNumberScores(id)
    }
    
    res.json(player);
})

router.route("/").get(async (req, res) => {
    const searchTerm = req.query.searchTerm as string
    const pageNumber = parseInt(req.query.pageNumber as string)
    const pageSize = parseInt(req.query.pageSize as string)
    const order = { firstCount: req.query.order }
    const regex = new RegExp(searchTerm, "i");
    const page = await PlayerModel.find({ name: { $regex: regex } }).sort(order).skip(pageSize * (pageNumber - 1)).limit(pageSize)

    const promises: Promise<number>[] = []
    for (const player of page) {
        promises.push(getNumberScores(player.id))
    }
    const counts = await Promise.all(promises)
    for (let i = 0; i < page.length; i++) {
        page[i].firstCount = counts[i]
    }

    const count = await PlayerModel.countDocuments({ name: { $regex: regex } })
    res.json({ players: page, numberPlayers: count })
})

router.route("/refresh/:id").post(async (req, res) => {
    if (!osuApi) {
        osuApi = new osu.Api(process.env.OSU_KEY??"", { 
            notFoundAsError: false, // Throw an error on not found instead of returning nothing. (default: true)
            completeScores: false, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
            parseNumeric: true // Parse numeric values into numbers/floats, excluding ids
        })
    }

    const id = req.params.id
    const scores = await osuApi.getUserRecent({ u: id, type: "id", limit: 50 })
    if (scores) {
        for (const score of scores) {
            let prev = new Date().getTime()
            if (score.rank == 'F') continue;
            const id = parseInt(score.beatmapId as string)
            const beatmap = await BeatmapModel.findOne({ id: id })
            const oldScore = await ScoreModel.findOne({ beatmapId: id })

            if (oldScore) {
                if (score.score < oldScore.score) {
                    continue;
                }
            }

            if (beatmap) {
                try {
                    await updateBeatmap(id, await getCookieJar(), beatmap, prev)
                } catch(err) {
                    const difference = 2000 - (new Date().getTime() - prev)
                    // ensure no more than 2 requests per second
                    if (difference > 0) {
                        await new Promise(resolve => setTimeout(resolve, difference))
                    }
                    console.log(err)
                }
            }
        }
    }

    res.json()
})



export default router