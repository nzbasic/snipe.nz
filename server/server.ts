import express from 'express';
import scoreRouter from './routers/score';
import playerRouter from './routers/player';
import beatmapRouter from './routers/beatmaps'
import activityRouter from './routers/activity'
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path'
dotenv.config();

const app = express();
const port = 8080;

mongoose.connect(process.env.MONGO??"", {})
mongoose.connection.on('connected', () => console.log("Mongo connected"))

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

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"), (err) => {
        if (err) {
          res.status(500).send(err);
        }
    });
})

app.listen(port, () => console.log(`Server is starting at ${port}`));
