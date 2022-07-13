import { FormattedSnipe, Snipe } from './../../models/Snipe.model';
import {
    Alias,
    Command,
    Client,
    Argument,
    StringType
} from "@frasermcc/overcord";
import axios from "axios";
import { Message, MessageEmbed } from "discord.js";
import { Player } from "../../models/Player.model";
import { UserModel } from '../models/User.model';

@Alias("!snipe-profile")
export default class Leaderboard extends Command {
    @Argument({ type: new StringType(), optional: true })
    name!: string;

    async execute(message: Message, client: Client) {
        let id: string;

        if (this.name) {
            const { data } = await axios.get<number | { error: string }>("https://snipe.nz/api/players/nameToId/" + this.name)
            if (typeof data === "object") {
                message.channel.send(data.error)
                return
            }

            id = data.toString()
        } else {
            id = (await UserModel.findOne({ discordId: message.author.id }))?.osuId??""
        }

        if (!id) {
            message.channel.send("You need to do !snipe-link <username>")
            return
        }

        const pageSize = 5;
        const pageNumber = 1;
        const option = "7"

        const { data: playerData } = await axios.get<Player>("https://snipe.nz/api/players/" + id)
        const { data: snipeData } = await axios.get("https://snipe.nz/api/activity/sniped/" + id, { params: { pageSize, pageNumber, playerAsSniper: true } })
        const { data: victimData } = await axios.get("https://snipe.nz/api/activity/sniped/" + id, { params: { pageSize, pageNumber, playerAsSniper: false } })
        const { data: activityData } = await axios.get("https://snipe.nz/api/activity/latestId/" + id, { params: { pageNumber, pageSize, option, playerId: 0 }})

        const embed = new MessageEmbed()
        embed.setTitle(`${playerData.name}'s Snipe Profile`)
        embed.setDescription(`[osu!](https://osu.ppy.sh/users/${id}) | [snipe.nz](https://snipe.nz/player/${id})`)
        embed.setColor("#192227")
        embed.setThumbnail("https://a.ppy.sh/" + id)
        embed.addField("Total #1s", playerData.firstCount.toString());

        let sniping = ''
        let victiming = ''

        for (const snipe of snipeData.page) {
            sniping += `${snipe.total} ${snipe.name}\n`
        }

        for (const victim of victimData.page) {
            victiming += `${victim.total} ${victim.name}\n`
        }

        let activity = ''
        for (const snipe of activityData.page) {
            activity += `${snipe.sniper} sniped ${snipe.victim} - ${snipe.beatmap} - <t:${~~(snipe.time / 1000)}:R>\n`
        }

        if (activity === '') activity = 'No recent activity'
        if (sniping === '') sniping = `${playerData.name} has not sniped anyone`
        if (victiming === '') victiming = `${playerData.name} has not been sniped by anyone`

        embed.addField("Has sniped", sniping)
        embed.addField("Sniped by", victiming)
        embed.addField("Recent Activity", activity)

        message.channel.send({ embeds: [embed] })
    }
}