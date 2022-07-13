import { User } from '../models/User.model';
import {
    Alias,
    Inhibit,
    Permit,
    Command,
    Argument,
    BooleanType,
    IntegerType,
    UnionType,
    FloatType,
    Client,
    StringType,
} from "@frasermcc/overcord";
import { osuApi } from '../bot'
import { Channel, Message } from "discord.js";
import { UserModel } from '../models/User.model'
import { updateBeatmap } from '../../shared/updatemap'
import { getCookieJar } from '../../shared/jar'
import { BeatmapModel } from '../../models/Beatmap.model'
import { Player, PlayerModel } from "../../models/Player.model";
import { scoresOn } from "./ScoresOn";
import { DiscordScore } from '../../models/play'
import { Document } from 'mongoose'

const regex = "[<>!](rs|r)\\d*"

@Alias(regex)
export default class Link extends Command {
    @Argument({ type: new StringType(), optional: true })
    name!: string;
    
    async execute(message: Message, client: Client) {
        const command = (message.content.match(regex)??[""])[0]
        const endNumber = command.match(/\d+$/g)
        let number = 1
        let id = false
        let user: (Document<any, any, User> & User) | null

        if (endNumber) {
            number = parseInt(endNumber[0])
        }

        if (!this.name) {
            user = await UserModel.findOne({ discordId: message.author.id })
            this.name = user?.osuId??""
            id = true
        }
    
        if (this.name) {
            try {
                let userId: number
                if (!id) {
                    const user = await osuApi.getUser(this.name, { key: "username", fromCache: true })
                    if (!user) return message.channel.send("Couldn't find user")
                    userId = user.id
                } else {
                    userId = parseInt(this.name)
                }

                const scores = await osuApi.getUserScores(userId, "recent", { include_fails: 1, mode: "osu", calculateUnrankedPerformance: true, limit: number, fullBeatmaps: true })
                if (!scores) return

                if (scores.length) {
                    const recent = scores[number-1];
                    if (recent.rank === "F") return 

                    const jar = await getCookieJar();

                    let player = await PlayerModel.findOne({ id: userId })
                    if (!player) {
                        player = await new PlayerModel({ id: userId, name: recent.user.username, firstCount: 0 }).save()
                    } 

                    const discordScore: DiscordScore = {
                        player,
                        score: recent
                    }

                    const res = await updateBeatmap(recent.beatmap.id, jar, undefined, discordScore)

                    if (typeof res === "object") {
                        const sniper = await PlayerModel.findOne({ id: res.sniper })
                        const victim = await PlayerModel.findOne({ id: res.victim })
                        const victimUser = await UserModel.findOne({ osuId: res.victim.toString(10) })
                        if (sniper && victim) {
                            let newMessage = `${sniper.name} has sniped ${victim.name} on ${recent.beatmap.beatmapset.title}`
                            if (victimUser && victimUser.ping && (victim.id != sniper.id)) {
                                newMessage += ` <@${victimUser.discordId}>`
                            }
                            message.channel.send(newMessage)
                        }
                    } else if (typeof res === "number") {
                        const sniper = await PlayerModel.findOne({ id: res })
                        if (sniper) {
                            message.channel.send(`${sniper.name} got the first score on ${recent.beatmap.beatmapset.title}`)
                        }
                    }

                    if (scoresOn) {
                        let mods = "+"
                        if (typeof recent.mods === "string") {
                            mods += recent.mods
                        } else {
                            recent.mods.forEach(mod => {
                                if (mod === "Hidden") {
                                    mods += "HD"
                                } else if (mod === "HardRock") {
                                    mods += "HR"
                                } else if (mod === "DoubleTime") {
                                    mods += "DT"
                                } else if (mod === "Easy") {
                                    mods += "EZ"
                                } else if (mod === "HalfTime") {
                                    mods += "HT"
                                } else if (mod === "Nightcore") {
                                    mods += "NC"
                                } else if (mod === "NoFail") {
                                    mods += "NF"
                                } else if (mod === "Perfect") {
                                    mods += "PF"
                                } else if (mod === "Relax") {
                                    mods += "RX"
                                } else if (mod === "SuddenDeath") {
                                    mods += "SD"
                                } else if (mod === "SpunOut") {
                                    mods += "SO"
                                } else if (mod === "TouchDevice") {
                                    mods += "TD"
                                } else if (mod === "Flashlight") {
                                    mods += "FL"
                                }
                            })
                        }

                        // const string = beatmap.artist + " - " + beatmap.song + " [" + beatmap.difficulty + "] mapped by " + beatmap.mapper + "\n"
                        //     + recent.rank + " " + recent.score + " " + mods + " " + recent.maxCombo + "x " + recent.counts['300'] + "/" + recent.counts['100'] + "/" + recent.counts['50'] + "/" + recent.counts.miss + "\n";
                        //message.channel.send(string)
                    }
                }
            } catch (err: unknown) {
                console.error(err)
            }
        }
    }
}