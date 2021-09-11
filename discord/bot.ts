import { Client } from "@frasermcc/overcord";
import path from "path";
import dotenv from 'dotenv'
import osu from 'node-osu'
import mongoose from 'mongoose'
dotenv.config();

export let osuApi: osu.Api;

(async () => {
    osuApi = new osu.Api(process.env.OSU??"", {
        notFoundAsError: true,
        completeScores: false, 
        parseNumeric: true
    });

    mongoose.connect(process.env.MONGO??"", {})
    mongoose.connection.on("connected", async () => {
        console.log("mongo connected")
    })

    const client = new Client({ intents: 32509, defaultCommandPrefix: "", owners: [] });
    await client.registry.recursivelyRegisterCommands(path.join(__dirname, "/commands"));
    client.login(process.env.BOT_TOKEN??"");
})();