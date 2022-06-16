import {
    Alias,
    Command,
    Client
} from "@frasermcc/overcord";
import axios from "axios";
import { Message, MessageEmbed } from "discord.js";
import { Player } from "../../models/Player.model";

@Alias("!snipe-lb")
export default class Leaderboard extends Command {
    async execute(message: Message, client: Client) {
        const { data } = await axios.get<{ players: Player[] }>("https://snipe.nz/api/players", { params: { pageNumber: 1, pageSize: 10, order: -1 }})
        const embed = new MessageEmbed()
        embed.setTitle("Snipe Leaderboard")
        embed.setColor("#192227")
    
        for (let i = 0; i < data.players.length; i++) {
            const player = data.players[i]
            embed.addField(
                `${i + 1}. ${player.name}`,
                `${player.firstCount}`
            )
        }

        message.channel.send({ embeds: [embed] })
    }
}