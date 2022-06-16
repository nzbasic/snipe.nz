import { FormattedSnipe } from './../../models/Snipe.model';
import {
    Alias,
    Command,
    Client
} from "@frasermcc/overcord";
import axios from "axios";
import { Message, MessageEmbed } from "discord.js";
import { Player } from "../../models/Player.model";

@Alias("!snipe-recent")
export default class Leaderboard extends Command {
    async execute(message: Message, client: Client) {
        const { data } = await axios.get<FormattedSnipe[]>("https://snipe.nz/api/activity/latest/" + 10)
        const embed = new MessageEmbed()
        embed.setTitle("Recent Snipes")
        embed.setColor("#192227")

        for (let i = 0; i < data.length; i++) {
            const snipe = data[i]
            embed.addField(
                `${snipe.sniper} sniped ${snipe.victim}`,
                `[${snipe.beatmap}](https://osu.ppy.sh/beatmaps/${snipe.beatmapId}) - <t:${~~(snipe.time / 1000)}:R>`
            )
        }

        message.channel.send({ embeds: [embed] })
    }
}