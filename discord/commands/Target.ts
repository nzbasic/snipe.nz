import {
    Alias,
    Command,
    Client
} from "@frasermcc/overcord";
import axios from "axios";
import { Message } from "discord.js";

@Alias("!snipe-target")
export default class Target extends Command {
    async execute(message: Message, client: Client) {
        const res = await axios.get("https://snipe.nz/api/target")
        const target = res.data.target
        message.channel.send(`Current Target: ${target.player.name}. Ends <t:${~~(target.dateEnd / 1000)}:R>`)
    }
}