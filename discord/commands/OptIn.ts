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

@Alias("!snipe-alert")
export default class OptIn extends Command {
    @Argument({ type: new StringType() })
    mode!: string;

    async execute(message: Message, client: Client) {
        const found = await UserModel.findOne({ discordId: message.author.id })
        if (found) {
            if (this.mode == "off") {
                found.ping = false
                message.channel.send('Alerts turned off, you will no longer be pinged when someone snipes you.')
            } else {
                found.ping = true
                message.channel.send('Alerts turned on, you will now be pinged when someone snipes you. You can opt out by typing !snipe-alert off')
            }
            found.save()
        } else {
            message.channel.send('Please link your osu! account with !snipe-link <name>')
        }
    }
}