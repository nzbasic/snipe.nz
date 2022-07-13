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

    const ids = (await IdModel.find()).map(x => x.id as number)
    const jar = await getCookieJar()

    for (let i = 0; i < ids.length; i++) {
        if (i % 100 == 0) {
            console.log(i + " / " + ids.length)
        }

        try { 
            await updateBeatmap(ids[i], jar)
        } catch(err) {
            console.log(err)
        }
    }
})()




