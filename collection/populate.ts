import { BannedModel } from './../models/Banned.model';
import { BeatmapModel, CHBeatmap } from './../models/Beatmap.model';
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import { updateBeatmap } from '../shared/updatemap';
import { getCookieJar } from '../shared/jar';
import fg from 'fast-glob';
import { PlayerModel } from '../models/Player.model';
import { convertToObject } from 'typescript';
import { Database as Sqlite3, Statement } from "sqlite3";
import { open, Database } from "sqlite";
import { IdModel } from '../models/Id.model'

dotenv.config();

(async () => {
    const mongo = process.env.MONGO??""
    await mongoose.connect(mongo)

    const path = "/app/osu"
    const files = fs.readdirSync(path)

    for (const file of files) {
        const id = parseInt(file.split(".")[0])
        await IdModel.create({ id })
    }

    // const database = await open({ filename: "database.db", driver: Sqlite3 });
    // const ids = await database.all("SELECT id FROM beatmaps")
    // ids.reverse()
    // console.log(ids[1])

    // const jar = await getCookieJar()

    // let i = 0;
    // for (const id of ids.map(i => i.id)) {
    //     if (i % 10 == 0) {
    //         console.log(i + " / " + ids.length)
    //     }

    //     try { 
    //         await updateBeatmap(id, jar)
    //     } catch(err) {
    //         console.log(err)
    //     }
    //     i++
    // }
})()




