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

@Alias("!snipe-refresh")
export default class Refresh extends Command {
    @Argument({ type: new IntegerType() })
    id!: number;
    
    async execute(message: Message, client: Client) {
        try {
            const jar = await getCookieJar();
            const beatmap = await BeatmapModel.findOne({ id: this.id })
            if (beatmap) {
                const res = await updateBeatmap(this.id, jar)
                console.log(res)
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
                } else {
                    
                    message.channel.send("No updates to be made")
                }
            } else {
                message.channel.send("Beatmap not found in db")
            }
        } catch (err: unknown) {
            console.error(err)
        }
    }
}