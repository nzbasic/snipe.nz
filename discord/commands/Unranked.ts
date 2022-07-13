import { FormattedSnipe, Snipe, SnipeModel } from './../../models/Snipe.model';
import {
    Alias,
    Command,
    Client,
    Argument,
    StringType,
    IntegerType
} from "@frasermcc/overcord";
import axios from "axios";
import { Message, MessageEmbed } from "discord.js";
import { who } from './WhoIs';
import { numberWithCommas } from '../util/commaNumber'
import { BeatmapModel } from '../../models/Beatmap.model';
import { PlayerModel } from '../../models/Player.model';
import { ScoreModel } from '../../models/Score.model';
import { UnrankedScoreModel } from '../../models/Unranked.model';
import { UnrankedSnipe, UnrankedSnipeModel } from '../../models/UnrankedSnipe.model';
import { Document } from 'mongoose'

@Alias("!snipe-map")
export default class Leaderboard extends Command {
    @Argument({ type: new IntegerType(), optional: true })
    id!: number;

    async execute(message: Message, client: Client) {
        let mapId = this.id
        const reference = message?.reference?.messageId

        if (reference) {
            const repliedTo = await message.channel.messages.fetch(reference);
            const embeds = repliedTo.embeds

            if (embeds.length) {
                const embed = embeds[0]
                const url = embed.url

                if (url) {
                    const id = url.split("/").pop()
                    if (id) {
                        mapId = parseInt(id)
                    }
                } else {
                    message.reply("No url found in embed")
                    return
                }
            } else {
                message.reply("No embeds found")
                return
            }
        } else if (!this.id) {
            message.reply("You need to reply to a score post or give an ID")
            return
        }

        const map = await BeatmapModel.findOne({ id: mapId })
        if (!map) {
            message.reply("Map not found")
            return
        }

        const embed = new MessageEmbed()
        embed.setTitle(`${map.artist} - ${map.song} [${map.difficulty}]`)
        embed.setImage("https://assets.ppy.sh/beatmaps/" + map.setId + "/covers/cover.jpg")
        embed.setDescription(`[osu!](https://osu.ppy.sh/beatmaps/${map.id}) | [snipe.nz](https://snipe.nz/beatmap/${map.id})`)
        embed.setColor("#192227")

        let numberOneScore = 'No score found!'
        if (map.playerId) {
            const player = await PlayerModel.findOne({ id: map.playerId })
            if (player) {
                let score;
                if (map.unranked) {
                    const scores = await UnrankedScoreModel.find({ beatmapId: map.id }).sort({ score: -1 }).limit(1)
                    if (scores.length) score = scores[0]
                } else {
                    score = await ScoreModel.findOne({ beatmapId: map.id })
                }

                if (score) {
                    let mods = ""
                    if (score.mods.length) mods = `+${score.mods.join("")}`
                    numberOneScore = `${numberWithCommas(score.score)}: [${player.name}](https://osu.ppy.sh/users/${player.id}) ${mods}`
                }
            }
        }
        embed.addField("Current #1", numberOneScore)

        let detailsString = ''
        detailsString += `BPM: ${map.bpm}\n`
        detailsString += `AR: ${map.ar}\n`
        detailsString += `OD: ${map.od}\n`
        detailsString += `HP: ${map.hp}\n`
        detailsString += `CS: ${map.cs}\n`
        detailsString += `Mapper: ${map.mapper}\n`
        if (!detailsString) detailsString = 'Error finding beatmap details'
        embed.addField("Details", detailsString)

        let snipes: (Document<any, any, UnrankedSnipe> & UnrankedSnipe)[] | (Document<any, any, Snipe> & Snipe)[]  = []
        if (map.unranked) {
            let scoresString = ''
            const scores = await UnrankedScoreModel.find({ beatmapId: map.id }).sort({ score: -1 }).limit(10)
            for (const score of scores) {
                let mods = ""

                score.mods.forEach(mod => {
                    if (mod === "Hidden") {
                        mods += "HD"
                    } else if (mod === "HardRock") {
                        mods += "HR"
                    } else if (mod === "DoubleTime") {
                        mods += "DT"
                    } else if (mod === "Easy") {
                        mods += "EZ"
                    } else if (mod === "HalfTime") {
                        mods += "HT"
                    } else if (mod === "Nightcore") {
                        mods += "NC"
                    } else if (mod === "NoFail") {
                        mods += "NF"
                    } else if (mod === "Perfect") {
                        mods += "PF"
                    } else if (mod === "Relax") {
                        mods += "RX"
                    } else if (mod === "SuddenDeath") {
                        mods += "SD"
                    } else if (mod === "SpunOut") {
                        mods += "SO"
                    } else if (mod === "TouchDevice") {
                        mods += "TD"
                    } else if (mod === "Flashlight") {
                        mods += "FL"
                    }
                })

                if (score.mods.length) mods = `+${mods}`
                const player = await PlayerModel.findOne({ id: score.playerId })
                if (player) {
                    scoresString += `${numberWithCommas(score.score)}: ${player.name} ${mods}\n`
                }
            }

            if (!scoresString) scoresString = 'No scores found!'
            embed.addField("Top Scores (unranked)", scoresString)
            snipes = await UnrankedSnipeModel.find({ beatmap: map.id }).sort({ time: -1 }).limit(5)
        } else {
            snipes = await SnipeModel.find({ beatmap: map.id }).sort({ time: -1 }).limit(5)
        }

        let latestSnipes = ''
        for (const snipe of snipes) {
            const sniper = await PlayerModel.findOne({ id: snipe.sniper })
            const victim = await PlayerModel.findOne({ id: snipe.victim })
            if (sniper && victim) {
                latestSnipes += `${sniper.name} sniped ${victim.name} <t:${~~(snipe.time / 1000)}:R>\n`
            }
        }
        if (!latestSnipes) latestSnipes = 'No snipes found!'
        embed.addField("Latest Snipes", latestSnipes)

        message.channel.send({ embeds: [embed] })
    }
}