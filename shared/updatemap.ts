import { SnipeModel } from './../models/Snipe.model';
import { Beatmap, BeatmapModel, CHBeatmap } from './../models/Beatmap.model';
import { ApiScore, ScoreModel } from './../models/Score.model';
import got from 'got'
import { CookieJar } from 'tough-cookie';
import { PlayerModel } from '../models/Player.model';
import { getNumberScores } from '../server/routers/score';

export const updateBeatmap = async (id: number, jar: CookieJar, beatmap: CHBeatmap | Beatmap, prev?: number) => {
    const url = "https://osu.ppy.sh/beatmaps/" + beatmap.id + "/scores?type=country&mode=osu"
    let response = await got(url, {cookieJar: jar, timeout: 30000})
    const scores: ApiScore[] = JSON.parse(response.body).scores

    if (prev) {
        const difference = 1100 - (new Date().getTime() - prev)

        // ensure dont overload api
        if (difference > 0) {
            await new Promise(resolve => setTimeout(resolve, difference))
        }
    } 

    if (scores.length > 0) {
        const firstPlace = scores[0]
        const foundScore = await ScoreModel.findOne({ id: firstPlace.id })
        let player = await PlayerModel.findOne({ id: firstPlace.user_id})

        if (!player) {
            player = await new PlayerModel({ id: firstPlace.user_id, name: firstPlace.user.username }).save()
        } else {
            player.name = firstPlace.user.username
            player.save()
        }

        // if there is no found score with the maps first place id, that means there has been a snipe OR there is a new score on a map with no plays
        if (!foundScore) {
            // does another score exist on this map? 
            const existing = await ScoreModel.findOne({ beatmapId: beatmap.id })

            if (existing) {
                const snipedPlayer = await PlayerModel.findOne({ id: existing.playerId })
                if (existing.playerId == firstPlace.user_id) {
                    // sniped themselves, still need to update the score 
                    console.log(existing.playerId + " sniped themselves")
                } else {
                    console.log("new snipe on " + beatmap.id + " by " + firstPlace.user.username + " victim " + existing.playerId)
                    new SnipeModel({
                        beatmap: beatmap.id,
                        sniper: firstPlace.user_id,
                        victim: existing.playerId,
                        time: new Date(firstPlace.created_at).getTime()
                    }).save()
    
                    // update beatmap
                    const oldBeatmap = await BeatmapModel.findOne({ id: beatmap.id })
                    if (oldBeatmap) {
                        oldBeatmap.playerId = firstPlace.user_id
                        oldBeatmap.save()
                    }
                }

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

                // remove the old score
                existing.delete();

                player.firstCount = await getNumberScores(player.id)
                player.save()
                if (snipedPlayer) {
                    snipedPlayer.firstCount = await getNumberScores(snipedPlayer.id)
                    snipedPlayer.save()
                }

                // dont need to do anything else
                return;
            } else { // there was no other score on the map, make sure to update the maps first place holder
                console.log("first score on " + firstPlace.beatmap.id + " by " + firstPlace.user.username)
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

                const foundMap = await BeatmapModel.findOne({ id: id })
                if (foundMap) {
                    foundMap.playerId = firstPlace.user_id
                    foundMap.lastUpdated = new Date(firstPlace.beatmap.last_updated).getTime()
                    foundMap.drain = firstPlace.beatmap.drain
                    foundMap.save()
                }

                player.firstCount = await getNumberScores(player.id)
                player.save()

                return;
            }
        } 

        const foundMap = await BeatmapModel.findOne({ id: firstPlace.beatmap.id })

        if (!foundMap) {
            console.log('added' + beatmap.id)
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
        } else { // this probably never gets called?
            console.log("set " + firstPlace.user_id + " 1st on " + foundMap.id)
            player.firstCount = await getNumberScores(player.id)
            player.save()
            foundMap.playerId = firstPlace.user_id
            foundMap.save()
        } 
    } else {
        const foundBeatmap = await BeatmapModel.findOne({ id: id })

        if (!foundBeatmap) {
            new BeatmapModel({
                artist: beatmap.artist,
                song: beatmap.song,
                difficulty: beatmap.difficulty,
                sr: beatmap.sr,
                setId: beatmap.setId,
                id: beatmap.id,
                ar: beatmap.ar,
                od: beatmap.od,
                bpm: beatmap.bpm,
                cs: beatmap.cs,
                hp: beatmap.hp,
                rankedDate: null,
                drain: null,
                mapper: beatmap.mapper,
                playerId: null
            }).save()
            console.log("no scores on " + beatmap.id)
        }
    }
}

