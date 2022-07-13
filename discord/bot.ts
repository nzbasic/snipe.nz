import { Client } from "@frasermcc/overcord";
import path from "path";
import dotenv from 'dotenv'
import osu from 'node-osu'
import mongoose from 'mongoose'
import { BeatmapModel } from "../models/Beatmap.model";
import { Client as OsuClient } from '@nzbasic/osu-proxy-wrapper'

//dotenv.config();

dotenv.config()

export let osuApi: OsuClient

(async () => {
    osuApi = new OsuClient(process.env.PROXY_URL??"", "discord-snipe.nz")
    console.log("api initialized")

    console.log("mongoose loading")
    await mongoose.connect(process.env.MONGO??"")
    console.log("mongoose loaded")

    mongoose.connection.on("error", (err) => {
        console.error(err)
    })

    console.log("creating client")
    const client = new Client({ intents: 32509, defaultCommandPrefix: "", owners: [] });
    await client.registry.recursivelyRegisterCommands(path.join(__dirname, "/commands"));
    console.log("client created")

    console.log("logging in")
    await client.login(process.env.BOT_TOKEN??"");
    console.log("logged in")
})();