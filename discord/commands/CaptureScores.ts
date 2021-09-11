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

@Alias("!rs", "!r", "<rs", ">rs")
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