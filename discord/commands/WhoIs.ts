import {
    Alias,
    Command,
    Client,
    Argument,
    IntegerType
} from "@frasermcc/overcord";
import axios from "axios";
import { Message } from "discord.js";
import { Player, PlayerModel } from "../../models/Player.model";
import { Score, ScoreModel } from "../../models/Score.model";
import { numberWithCommas } from '../util/commaNumber'

@Alias("!snipe-who")
export default class Target extends Command {
    @Argument({ type: new IntegerType(), optional: true })
    id!: number;

    async execute(message: Message, client: Client) {

        const reference = message?.reference?.messageId

        if (this.id) {
            const [score, player] = await who(this.id)
            if (player && score) {
                message.channel.send(player.name + " is #1 with " + numberWithCommas(score.score) + " points!")
            } else {
                message.channel.send("None found")
            }
        } else if (reference) {
            const repliedTo = await message.channel.messages.fetch(reference);
            const embeds = repliedTo.embeds

            if (embeds.length) {
                const embed = embeds[0]
                const url = embed.url

                if (url) {
                    const id = url.split("/").pop()
                    if (id) {
                        const [score, player] = await who(parseInt(id))
                        if (player && score) {
                            message.channel.send(player.name + " is #1 with " + numberWithCommas(score.score) + " points!")
                        } else {
                            message.channel.send("None found")
                        }
                    }
                } else {
                    message.reply("No url found in embed")
                }
            } else {
                message.reply("No embeds found")
            }
        } else {
            message.reply("You need to reply to a score post or give an ID")
        }
    
    }
}

const who = async (id: number): Promise<[Score | null, Player | null]> => {
    const score = await ScoreModel.findOne({ beatmapId: id })
    if (score) {
        const player = await PlayerModel.findOne({ id: score.playerId })
        if (player) {
            return [score, player]
        } else {
            return [null, null]
        }
    } else {
        return [null, null]
    }
}