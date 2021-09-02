import { BeatmapModel, CHBeatmap } from './../models/Beatmap.model';
import { ApiScore, ScoreModel } from './../models/Score.model';
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import jsdom from 'jsdom'
import got from 'got'
import fs from 'fs'
import { CookieJar } from 'tough-cookie'
import { promisify } from 'util'
import { Player, PlayerModel } from "../models/Player.model"
const { JSDOM } = jsdom;

dotenv.config();

(async () => {
    const mongo = process.env.MONGO??""
    await mongoose.connect(mongo);

    const data = await fs.promises.readFile("ids.json")
    const beatmaps: CHBeatmap[] = JSON.parse(data.toString())

    const jar = new CookieJar();
    const setCookie = promisify(jar.setCookie.bind(jar))
    await setCookie(process.env.COOKIE, 'https://osu.ppy.sh')

    let i = 0;
    for (const beatmap of beatmaps) {
        if (i % 10 == 0) {
            console.log(i)
        }

        try { 
            const url = "https://osu.ppy.sh/beatmaps/" + beatmap.id + "/scores?type=country&mode=osu"
            const prev = new Date().getTime()
            const response = await got(url, {cookieJar: jar})
            const scores: ApiScore[] = JSON.parse(response.body).scores
            const difference = 500 - (new Date().getTime() - prev)
    
            // ensure no more than 2 requests per second
            if (difference > 0) {
                await new Promise(resolve => setTimeout(resolve, difference))
            }
    
            if (scores.length > 0) {
                const firstPlace = scores[0]
                const foundScore = await ScoreModel.findOne({ id: firstPlace.id })
    
                if (!foundScore) {
                    new ScoreModel({ 
                        id: firstPlace.id,
                        playerId: firstPlace.user_id,
                        beatmapId: beatmap.id,
                        score: firstPlace.score,
                        acc: firstPlace.accuracy,
                        mods: firstPlace.mods,
                        date: firstPlace.created_at,
                        pp: firstPlace.pp,
                        missCount: firstPlace.statistics.count_miss,
                        maxCombo: firstPlace.max_combo
                    }).save()
    
                    const player = await PlayerModel.findOne({ id: firstPlace.user_id })
                
                    if (!player) {
                        new PlayerModel({
                            id: firstPlace.user_id,
                            name: firstPlace.user.username,
                            firstCount: 1
                        }).save()
                    } else {
                        player.firstCount++
                        player.save()
                    }
        
                    const foundMap = await BeatmapModel.findOne({ id: firstPlace.beatmap.id })
        
                    if (!foundMap) {
                        new BeatmapModel({
                            artist: beatmap.artist,
                            song: beatmap.song,
                            difficulty: firstPlace.beatmap.version,
                            sr: firstPlace.beatmap.difficulty_rating,
                            setId: firstPlace.beatmap.beatmapset_id,
                            id: firstPlace.beatmap.id,
                            ar: firstPlace.beatmap.ar,
                            od: beatmap.od,
                            bpm: firstPlace.beatmap.bpm,
                            cs: firstPlace.beatmap.cs,
                            hp: beatmap.hp,
                            rankedDate: firstPlace.beatmap.last_updated,
                            drain: firstPlace.beatmap.drain,
                            mapper: beatmap.mapper,
                            playerId: firstPlace.user_id
                        }).save()
                    } else {
                        foundMap.playerId = firstPlace.user_id
                        foundMap.save()
                    }
                }
            }
        } catch(err) {
            console.log(err)
        }
        
        i++
    }
})()




