import express from 'express';
import { ScoreModel } from '../../models/Score.model'
import { PlayerModel } from '../../models/Player.model';
import { Play } from '../../models/play';
import { BeatmapModel } from '../../models/Beatmap.model';
import sqlite3 from 'sqlite3'
import { Database, open } from "sqlite";
import fs from 'fs'
sqlite3.verbose()

const router = express.Router();
export const getNumberScores = async (id: number) => {
    return ScoreModel.countDocuments({ playerId: id });
}

router.route("/numberScores").get(async (req, res) => {
    const id = req.body.id;
    res.json(await getNumberScores(id));
})

router.route("/").get(async (req, res) => {
    const id = parseInt(req.query.id as string)
    const pageNumber = parseInt(req.query.pageNumber as string)
    const pageSize = parseInt(req.query.pageSize as string)
    const sortBy = req.query.sortBy as string
    const sortOrder = req.query.sortOrder as string
    const order = { [sortBy]: sortOrder === "asc" ? 1 : -1 }
    const page: Play[] = []
    const option: any = {}

    if (id) {
        option.playerId = id
    }

    const count = await ScoreModel.countDocuments(option)

    const scores = await ScoreModel.aggregate([
        { $match: option },
        { $sort: order },
        { $skip: pageSize * (pageNumber - 1) },
        { $limit: pageSize },
        { $lookup: { from: "players", localField: "playerId", foreignField: "id", as: "player" } },
        { $lookup: { from: "beatmaps", localField: "beatmapId", foreignField: "id", as: "beatmap" } },
        { $unwind: "$player" },
        { $unwind: "$beatmap" },
    ])

    //const scores = await ScoreModel.find(option).sort(order).skip(pageSize * (pageNumber - 1)).limit(pageSize)
    for (const score of scores) {
        const play: Play = { 
            id: score.id,
            beatmapId: score.beatmapId,
            artist: score.beatmap?.artist??"Map",
            song: score.beatmap?.song??"Not",
            mapper: score.beatmap?.mapper??"Sorry",
            difficulty: score.beatmap?.difficulty??"Found",
            pp: score?.pp??0,
            acc: score?.acc??0,
            mods: score?.mods??[],
            date: score?.date??"",
            score: score?.score??0,
            player: score.player?.name??"Player not found"
        }
        page.push(play)
    }

    res.json({ plays: page, numberPlays: count })
})

router.route("/export/:id").get(async (req, res) => {
    const id = parseInt(req.params.id as string)
    const path = "./" + id + ".db"
    const scores = await ScoreModel.aggregate([
        { $match: { playerId: id } },
        { $lookup: { from: "beatmaps", localField: "beatmapId", foreignField: "id", as: "beatmap" } },
        { $unwind: "$beatmap" },
    ])
    const hashes = scores.map(score => score.beatmap.hash)
    const buf = Buffer.from(JSON.stringify(hashes))

    const db = await open({filename: path, driver: sqlite3.Database})
    await db.run("CREATE TABLE IF NOT EXISTS collection (name TEXT PRIMARY KEY, beatmaps INTEGER, hashes BLOB)");
    await db.run("CREATE TABLE IF NOT EXISTS beatmaps (setId INTEGER, md5 TEXT PRIMARY KEY, folderName TEXT, zip BLOB)");
    await db.run("CREATE TABLE IF NOT EXISTS setidmap (md5 TEXT PRIMARY KEY, id INTEGER, setId INTEGER)")
    await db.run("BEGIN TRANSACTION")
    await db.run("INSERT INTO collection (name, beatmaps, hashes) VALUES (?, ?, ?)", [id, 0, buf])

    for (const score of scores) {
        await db.run("INSERT INTO setidmap (md5, id, setId) VALUES (?, ?, ?)", [score.beatmap.hash, score.beatmapId, score.beatmap.setId])
        await db.run("INSERT INTO beatmaps (setId, md5, folderName, zip) VALUES (?, ?, ?, ?)", [score.beatmap.setId, score.beatmap.hash, "", null])
    }

    await db.run("COMMIT")
    await db.close();

    res.download(path)
    fs.rm(path, () => {})
})

export default router