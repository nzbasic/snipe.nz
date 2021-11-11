import { SnipeModel } from './../models/Snipe.model';
import { Beatmap, BeatmapModel, CHBeatmap } from './../models/Beatmap.model';
import { ApiScore, ScoreModel } from './../models/Score.model';
import got from 'got'
import { CookieJar } from 'tough-cookie';
import { PlayerModel } from '../models/Player.model';
import { BannedModel } from '../models/Banned.model';
import jsdom from 'jsdom';
const { JSDOM } = jsdom

export const getNumberScores = async (id: number) => {
    return ScoreModel.countDocuments({ playerId: id });
}

export const updateBeatmap = async (id: number, jar: CookieJar, beatmap: CHBeatmap | Beatmap, prev?: number) => {
    const url = "https://osu.ppy.sh/beatmaps/" + beatmap.id + "/scores?type=country&mode=osu"
    let response = await got(url, {cookieJar: jar, timeout: 5000})
    const scores: ApiScore[] = JSON.parse(response.body).scores

    await new Promise(resolve => setTimeout(resolve, 2000))

    const beatmapDataUrl = "https://osu.ppy.sh/beatmaps/" + beatmap.id
    response = await got(beatmapDataUrl)
    const dom = new JSDOM(response.body)

    let beatmapSetData: any
    let beatmapData: any
    try {
        const data = dom.window.document.getElementById("json-beatmapset")
        if (data) {
            beatmapSetData = JSON.parse(data.innerHTML)
            beatmapData = beatmapSetData.beatmaps.find((x: any) => x.id == beatmap.id)
        }
    } catch(err) {
        return
    }

    if (prev) {
        const difference = 3000 - (new Date().getTime() - prev)

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
            await player.save()
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

                    if (existing.score > firstPlace.score) {
                        // case when current first place is banned.
                        console.log("snipe is worse than current score on " + beatmap.id + " dont bother")

                        // add a new banned score to check when unbanned
                        await new BannedModel({
                            playerId: existing.playerId,
                            beatmapId: beatmap.id,
                            score: existing.score
                        }).save()
                    } else {
                        const bannedScore = await BannedModel.findOne({ beatmapId: beatmap.id })
                        if (bannedScore && bannedScore.playerId == firstPlace.user_id) {
                            await bannedScore.delete()
                        } else {
                            await new SnipeModel({
                                beatmap: beatmap.id,
                                sniper: firstPlace.user_id,
                                victim: existing.playerId,
                                time: new Date(firstPlace.created_at).getTime()
                            }).save()
                        }
                    }

                    // update beatmap
                    const oldBeatmap = await BeatmapModel.findOne({ id: beatmap.id })
                    if (oldBeatmap) {
                        oldBeatmap.playerId = firstPlace.user_id
                        await oldBeatmap.save()
                    }
                }

                await new ScoreModel({ 
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
                await existing.delete();

                player.firstCount = await getNumberScores(player.id)
                await player.save()
                if (snipedPlayer) {
                    snipedPlayer.firstCount = await getNumberScores(snipedPlayer.id)
                    await snipedPlayer.save()
                }

                if (existing.playerId != firstPlace.user_id) {
                    return { victim: existing.playerId, sniper: firstPlace.user_id };
                } else {
                    return { victim: existing.playerId, sniper: existing.playerId }
                }
            } else { // there was no other score on the map, make sure to update the maps first place holder
                console.log("first score on " + beatmap.id + " by " + firstPlace.user.username)
                await new ScoreModel({ 
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
                if (beatmapData) {
                    if (foundMap) {
                        foundMap.playerId = firstPlace.user_id
                        foundMap.lastUpdated = beatmapData.last_updated,
                        foundMap.rankedDate = beatmapData.last_updated,
                        foundMap.drain = beatmapData.total_length,
                        await foundMap.save()
                    } else {
                        await new BeatmapModel({
                            artist: beatmap.artist,
                            song: beatmap.song,
                            difficulty: beatmapData.version,
                            sr: beatmapData.difficulty_rating,
                            setId: beatmapSetData.id,
                            id: beatmap.id,
                            ar: beatmapData.ar,
                            od: beatmapData.od,
                            bpm: beatmapData.bpm,
                            cs: beatmapData.cs,
                            hp: beatmapData.hp,
                            rankedDate: beatmapData.last_updated,
                            drain: beatmapData.total_length,
                            mapper: beatmap.mapper,
                            playerId: firstPlace.user_id,
                            hash: beatmapData.checksum,
                            hasSpinner: beatmapData.count_spinners > 0
                        }).save()
                        console.log("added " + beatmap.id)
                    }
                } else {
                    console.log('no map found for ' + beatmap.id)
                }

                player.firstCount = await getNumberScores(player.id)
                await player.save()

                return firstPlace.user_id;
            }
        } 

        const foundMap = await BeatmapModel.findOne({ id: beatmap.id })

        if (!foundMap) {
            if (beatmapData) {
                await new BeatmapModel({
                    artist: beatmap.artist,
                    song: beatmap.song,
                    difficulty: beatmapData.version,
                    sr: beatmapData.difficulty_rating,
                    setId: beatmapSetData.id,
                    id: beatmap.id,
                    ar: beatmapData.ar,
                    od: beatmapData.od,
                    bpm: beatmapData.bpm,
                    cs: beatmapData.cs,
                    hp: beatmapData.hp,
                    rankedDate: beatmapData.last_updated,
                    drain: beatmapData.total_length,
                    mapper: beatmap.mapper,
                    playerId: firstPlace.user_id,
                    hash: beatmapData.checksum,
                    hasSpinner: beatmapData.count_spinners > 0
                }).save()
                console.log("added " + beatmap.id)
            } else {
                console.log('no map found for ' + beatmap.id)
            }
        } else { // this probably never gets called?
            console.log("set " + firstPlace.user_id + " 1st on " + foundMap.id)
            player.firstCount = await getNumberScores(player.id)
            await player.save()
            foundMap.playerId = firstPlace.user_id
            if (beatmapData) {
                foundMap.drain = beatmapData.total_length
                foundMap.hash = beatmapData.checksum
                foundMap.hasSpinner = beatmapData.count_spinners > 0
            }
            await foundMap.save()
        } 
    } else {
        const foundBeatmap = await BeatmapModel.findOne({ id: id })

        if (!foundBeatmap && beatmapData) {
            await new BeatmapModel({
                artist: beatmap.artist,
                song: beatmap.song,
                difficulty: beatmapData.version,
                sr: beatmapData.difficulty_rating,
                setId: beatmapSetData.id,
                id: beatmap.id,
                ar: beatmapData.ar,
                od: beatmapData.od,
                bpm: beatmapData.bpm,
                cs: beatmapData.cs,
                hp: beatmapData.hp,
                rankedDate: beatmapData.last_updated,
                drain: beatmapData.total_length,
                mapper: beatmap.mapper,
                playerId: null,
                hash: beatmapData.checksum,
                hasSpinner: beatmapData.count_spinners > 0
            }).save()
            console.log("no scores on " + beatmap.id)
        }
    }
}

