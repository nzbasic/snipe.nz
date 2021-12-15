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

        await new Promise((resolve, reject) => setTimeout(resolve, 1000))

        if (endNumber) {
            number = parseInt(endNumber[0])
        }

        if (!this.name) {
            this.name = (await UserModel.findOne({ discordId: message.author.id }))?.osuId??""
            id = true
        }

        if (this.name) {
            try {
                const scores = await osuApi.getUserRecent({ u: this.name, type: id ? "id" : "string", limit: number })
                if (scores.length) {
                    const recent = scores[number-1];
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

                        const res = await updateBeatmap(id, jar)
                        if (typeof res === "object") {
                            const sniper = await PlayerModel.findOne({ id: res.sniper })
                            const victim = await PlayerModel.findOne({ id: res.victim })
                            const victimUser = await UserModel.findOne({ osuId: res.victim.toString(10) })
                            if (sniper && victim) {
                                let newMessage = `${sniper.name} has sniped ${victim.name} on ${beatmap.song}`
                                if (victimUser && victimUser.ping && (victim.id != sniper.id)) {
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