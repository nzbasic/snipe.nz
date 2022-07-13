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
            const user = await osuApi.getUser(this.name)
            if (!user) return message.channel.send("Could not find user via API")

            const found = await UserModel.findOne({ discordId: message.author.id })
            if (found) {
                found.osuId = user.id.toString(10)
                found.save()
            } else {
                await new UserModel({
                    discordId: message.author.id,
                    osuId: user.id
                }).save()
            }
            message.channel.send(`You are now linked to ${user.username}`)
        } catch (err: unknown) {
            message.channel.send((err as Error).message)
        }
    }
}