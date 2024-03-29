import express from 'express';
import scoreRouter from './routers/score';
import playerRouter from './routers/player';
import beatmapRouter, { loadData } from './routers/beatmaps'
import activityRouter from './routers/activity'
import targetRouter from './routers/target'
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path'
import { Target, TargetModel } from '../models/Target.model';
import { PlayerModel } from '../models/Player.model';
import { ScoreModel } from '../models/Score.model';
dotenv.config();

const app = express();
const port = 8080;

mongoose.connect(process.env.MONGO??"", {})

app.use(require("prerender-node").set("prerenderToken", process.env.PRERENDER))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors({ credentials: true, origin: true }))
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static("../client/build"));
}

app.use("/api/scores", scoreRouter);
app.use("/api/players", playerRouter);
app.use("/api/beatmaps", beatmapRouter);
app.use("/api/activity", activityRouter);
app.use("/api/target", targetRouter);

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"), (err) => {
        if (err) {
          res.status(500).send(err);
        }
    });
})

app.listen(port, () => console.log(`Server is starting at ${port}`));
