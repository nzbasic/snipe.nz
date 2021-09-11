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
import { Message } from "discord.js";
import { UserModel } from '../models/User.model'

@Alias("!snipe-link")
export default class Link extends Command {
    @Argument({ type: new StringType() })
    name!: string;

    async execute(message: Message, client: Client) {
        try {
            const osuUser = await osuApi.getUser({ u: this.name, type: "string" })
            const found = await UserModel.findOne({ discordId: message.author.id })
            if (found) {
                found.osuId = osuUser.id.toString(10)
                found.save()
            } else {
                const user = new UserModel({
                    discordId: message.author.id,
                    osuId: osuUser.id
                })
                await user.save()
            }
            message.channel.send(`You are now linked to ${osuUser.name}`)
        } catch (err: unknown) {
            message.channel.send((err as Error).message)
        }
    }
}