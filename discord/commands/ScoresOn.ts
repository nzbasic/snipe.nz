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

export let scoresOn = false;

@Alias("!snipe-scores-on")
@Permit("ADMINISTRATOR")
export default class ScoresOn extends Command {
    async execute(message: Message, client: Client) {
        if (scoresOn) {
            scoresOn = false;
            message.channel.send("Score posts are now off.")
        } else {
            scoresOn = true;
            message.channel.send("Score posts are now on.")
        }
    }
}