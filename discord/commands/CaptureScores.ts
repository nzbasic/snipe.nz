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
import { PlayerModel } from "../../models/Player.model";
import { scoresOn } from "./ScoresOn";

@Alias("!rs", "!r", "<rs", ">rs", "<r", ">r")
export default class Link extends Command {
    async execute(message: Message, client: Client) {
        const user = await UserModel.findOne({ discordId: message.author.id})
        if (user) {
            try {
                const scores = await osuApi.getUserRecent({ u: user.osuId, type: "id", limit: 1 })
                if (scores.length) {
                    const recent = scores[0];
                    const jar = await getCookieJar();
                    const id = parseInt(recent.beatmapId as string, 10)
                    const beatmap = await BeatmapModel.findOne({ id: id })

                    if (beatmap) {
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

                            const string = beatmap.artist + " - " + beatmap.song + " [" + beatmap.difficulty + "] mapped by " + beatmap.mapper + "\n"
                                + recent.rank + " " + recent.score + " " + mods + " " + recent.maxCombo + "x " + recent.counts['300'] + "/" + recent.counts['100'] + "/" + recent.counts['50'] + "/" + recent.counts.miss + "\n";
                            message.channel.send(string)
                        }

                        const res = await updateBeatmap(id, jar, beatmap)
                        if (typeof res === "object") {
                            const sniper = await PlayerModel.findOne({ id: res.sniper })
                            const victim = await PlayerModel.findOne({ id: res.victim })
                            const victimUser = await UserModel.findOne({ osuId: res.victim.toString(10) })
                            if (sniper && victim) {
                                let newMessage = `${sniper.name} has sniped ${victim.name} on ${beatmap.song}`
                                if (victimUser && victimUser.ping) {
                                    newMessage += ` <@${victimUser.discordId}>`
                                }
                                message.channel.send(newMessage)
                            }
                        } else if (typeof res === "number") {
                            const sniper = await PlayerModel.findOne({ id: res })
                            if (sniper) {
                                message.channel.send(`${sniper.name} got the first score on ${beatmap.song}`)
                            }
                        }
                    }
                }
            } catch (err: unknown) {
                console.error(err)
            }
        }
    }
}