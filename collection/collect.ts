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
dotenv.config();

(async () => {
    console.log("connecting")
    const mongo = process.env.MONGO??""
    await mongoose.connect(mongo);
   
    const data = await fs.promises.readFile("ids.json")
    const ids: number[] = JSON.parse(data.toString())
    const jar = await getCookieJar()

    let i = 0;
    for (const id of ids.slice(7000)) {
        if (i % 10 == 0) {
            console.log(i + " / " + ids.length)
        }

        let prev = new Date().getTime()
        try { 
            await updateBeatmap(id, jar, prev)
        } catch(err) {
            const difference = 5000 - (new Date().getTime() - prev)
            // ensure no more than 2 requests per second
            if (difference > 0) {
                await new Promise(resolve => setTimeout(resolve, difference))
            }
            console.log(err)
        }
        i++
    }
})()




