import axios from "axios"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { FormattedSnipe, Snipe } from "../../../models/Snipe.model"
import { Beatmap } from '../../../models/Beatmap.model'
import { Play } from "../../../models/play"
import { CircularProgress } from "@material-ui/core"
import { SingleActivity } from "../components/SingleActivity"
import NumberFormat from "react-number-format"
import { Helmet } from "react-helmet"
import CopyIcon from '@material-ui/icons/FileCopy';
import { CopyToClipboard } from "react-copy-to-clipboard"

export const BeatmapPage = () => {
    const { id } = useParams()
    const [beatmap, setBeatmap] = useState<Beatmap>()
    const [activity, setActivity] = useState<FormattedSnipe[]>([])
    const [isLoading, setLoading] = useState(true)
    const [bestScore, setBestScore] = useState<Play>()

    useEffect(() => {
        setLoading(true)
        axios.get("/api/beatmaps/details/" + id).then(res => {
            setBeatmap(res.data.beatmap)
            setActivity(res.data.activity)
            setBestScore(res.data.score)
            document.title = res.data.beatmap.song
            setLoading(false)
        })
    }, [id])

    return !isLoading ? (
        <div className="flex flex-col">
            <Helmet>
                <meta property="og:title" content={"Country #1 on " + beatmap?.song} />
                <meta property="og:description" content={`See the NZ country #1 history on ${beatmap?.artist} - ${beatmap?.song} [${beatmap?.difficulty}]`} />
                <meta property="og:image" content={"https://assets.ppy.sh/beatmaps/" + beatmap?.setId + "/covers/cover.jpg"} />
                <meta name="twitter:image" content={"https://assets.ppy.sh/beatmaps/" + beatmap?.setId + "/covers/cover.jpg"} />
                <meta name="twitter:title" content={"Country #1 on " + beatmap?.song} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:description" content={`See the NZ country #1 history on ${beatmap?.artist} - ${beatmap?.song} [${beatmap?.difficulty}]`} />
            </Helmet>
            <div className=" p-4 lg:p-16 items-center flex flex-col">
                <img className="p-2 lg:p-4 bg-white rounded-lg border-gray-200 border-2" src={"https://assets.ppy.sh/beatmaps/" + beatmap?.setId + "/covers/cover.jpg"} alt="Beatmap Cover" />
            </div>
            <div className="flex flex-col bg-black text-white text-xs lg:text-lg items-center p-8">
                <div className="flex gap-2">
                    <CopyToClipboard text={"https://osu.ppy.sh/beatmaps/" + beatmap?.id}>
                        <CopyIcon className="cursor-pointer" />
                    </CopyToClipboard>
                    <a href={"https://osu.ppy.sh/beatmaps/" + beatmap?.id} target="_blank" rel="noreferrer" className="animate-underline max-w-full truncate">{beatmap?.song} - {beatmap?.song} [{beatmap?.difficulty}]</a>
                </div>
                
            </div>
            <div className="flex flex-col bg-green-600 text-white text-xl p-8">
                <span className="text-2xl">Map Details:</span>
                <span>BPM: {beatmap?.bpm}</span>
                <span>Mapper: {beatmap?.mapper}</span>
                <span>AR: {beatmap?.ar.toFixed(1)}</span>
                <span>OD: {beatmap?.od.toFixed(1)}</span>
                <span>CS: {beatmap?.cs.toFixed(1)}</span>
                <span>HP: {beatmap?.hp.toFixed(1)}</span>
                <span>SR: {beatmap?.sr.toFixed(1)}</span>
                {beatmap?.rankedDate ? (
                    <div className="flex flex-col">
                        <span>{beatmap?.rankedDate && "Ranked: " + new Date(beatmap?.rankedDate).toLocaleDateString()}</span>
                        <span>{beatmap?.drain && "Drain Time: " + beatmap?.drain}</span>
                    </div>
                ) : ( null )}
                
                <span>Has Spinner: {beatmap?.hasSpinner ? "Yes" : "No"}</span>
            </div>
            {bestScore?.id ? (
                <div className="flex flex-col">
                    <div className="flex flex-col bg-black text-white p-8 text-xl">
                        <span className="text-2xl">Current Best Score:</span>
                        <div className="flex space-x-1">
                            <span>Player:</span>
                            <Link className="hover:underline" to={"/redirect/" + bestScore?.player}>{bestScore?.player}</Link>
                        </div>
                        <div className="flex space-x-1">
                            <span>Score:</span>
                            <NumberFormat className="hidden md:block" value={bestScore?.score} displayType={'text'} thousandSeparator={true}/>
                        </div>
                        <span>PP: {bestScore?.pp}</span>
                        <span>Acc: {(bestScore?.acc*100).toFixed(2)}%</span>
                        <span>Mods: {bestScore?.mods.join("")}</span>
                        <span>Date: {new Date(bestScore?.date??"").toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col text-white p-8 text-xl">
                        <span className="text-2xl">Snipe History</span>
                        {activity.length ? activity.map((item, index) => (
                            <div className="flex space-x-1 text-base">
                                <span className="truncate">{new Date(item.time).toLocaleDateString()}:</span>
                                <Link to={"/player/" + item.sniperId} className="hover:underline truncate text-green-400">{item.sniper}</Link>
                                <span>sniped</span>
                                <Link to={"/player/" + item.victimId} className="hover:underline truncate text-red-400">{item.victim}</Link>
                            </div>
                        )) : <span>No snipes recorded!</span>}
                    </div>
                </div>
            ) : <span className="text-white bg-black text-xl p-4">No Scores!</span>}
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center w-full h-screen">
            <CircularProgress size={200}></CircularProgress>
        </div>
    )
}