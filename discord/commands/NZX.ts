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
import { scrape } from "../util/scrape";

const regex = "[<>!](nz)\\d+"

@Alias(regex)
export default class Link extends Command {
    async execute(message: Message, client: Client) {
        const command = (message.content.match(regex)??[""])[0]
        const endNumber = command.match(/\d+$/g)

        if (endNumber) {
            const number = parseInt(endNumber[0])
            if (number > 10000 || number < 1) {
                return message.reply("Please enter a number between 1-10000")
            }

            const [player, pp] = await scrape(number)

            if (!player || !pp) {
                return message.reply("Could not find player for some reason")
            }

            message.channel.send(`NZ #${number} is held by ${player} with ${pp}pp`)
        } else {
            message.channel.send("no number given")
        }

    }
}