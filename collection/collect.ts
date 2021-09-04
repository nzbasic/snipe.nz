import { CHBeatmap } from './../models/Beatmap.model';
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import { updateBeatmap } from '../shared/updatemap';
import { getCookieJar } from '../shared/jar';
dotenv.config();

(async () => {
    const mongo = process.env.MONGO??""
    await mongoose.connect(mongo);

    const data = await fs.promises.readFile("ids.json")
    const beatmaps: CHBeatmap[] = JSON.parse(data.toString())
    const jar = await getCookieJar()

    let i = 0;
    for (const beatmap of beatmaps) {
        if (i % 10 == 0) {
            console.log(i)
        }

        let prev = new Date().getTime()
        try { 
            await updateBeatmap(beatmap.id, jar, beatmap, prev)
        } catch(err) {
            const difference = 2000 - (new Date().getTime() - prev)
            // ensure no more than 2 requests per second
            if (difference > 0) {
                await new Promise(resolve => setTimeout(resolve, difference))
            }
            console.log(err)
        }
        i++
    }
})()




