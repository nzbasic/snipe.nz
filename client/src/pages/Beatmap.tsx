import axios from "axios"
import { useEffect, useState } from "react"
import { RouteComponentProps } from "react-router-dom"
import { FormattedSnipe, Snipe } from "../../../models/Snipe.model"
import { Beatmap } from '../../../models/Beatmap.model'
import ScrollAnimation from "react-animate-on-scroll"
import { Play } from "../../../models/play"
import { CircularProgress } from "@material-ui/core"
import { SingleActivity } from "../components/SingleActivity"
import NumberFormat from "react-number-format"

export const BeatmapPage = (props: RouteComponentProps<{ id: string }>) => {
    const id = props.match.params.id
    const [beatmap, setBeatmap] = useState<Beatmap>()
    const [activity, setActivity] = useState<FormattedSnipe[]>([])
    const [isLoading, setLoading] = useState(true)
    const [bestScore, setBestScore] = useState<Play>()

    useEffect(() => {
        setLoading(true)
        axios.get("/api/beatmaps/details/" + id).then(res => {
            setBeatmap(res.data.beatmap)
            setActivity(res.data.activity)
            console.log(res.data.activity)
            setBestScore(res.data.score)
            setLoading(false)
        })
    }, [id])

    return !isLoading ? (
        <div className="flex flex-col">
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-indigo-400 p-4 lg:p-16 items-center flex flex-col">
                <img className="p-2 lg:p-4 bg-white rounded-lg border-gray-200 border-2" src={"https://assets.ppy.sh/beatmaps/" + beatmap?.setId + "/covers/cover.jpg"} alt="Beatmap Cover" />
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInRight" className="flex flex-col bg-black text-white text-xs lg:text-lg items-center p-8">
                <a href={"https://osu.ppy.sh/beatmaps/" + beatmap?.id} target="_blank" rel="noreferrer" className="animate-underline max-w-full truncate">{beatmap?.song} - {beatmap?.song} [{beatmap?.difficulty}]</a>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInLeft" className="flex flex-col bg-green-400 text-white text-xl p-8">
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
            </ScrollAnimation>
            {bestScore?.id ? (
                <div className="flex flex-col">
                    <ScrollAnimation animateIn="animate__slideInRight" className="flex flex-col bg-black text-white p-8 text-xl">
                        <span className="text-2xl">Current Best Score:</span>
                        <div className="flex space-x-1">
                            <span>Player:</span>
                            <a className="hover:underline" href={"/redirect/" + bestScore?.player}>{bestScore?.player}</a>
                        </div>
                        <div className="flex space-x-1">
                            <span>Score:</span>
                            <NumberFormat className="hidden md:block" value={bestScore?.score} displayType={'text'} thousandSeparator={true}/>
                        </div>
                        <span>PP: {bestScore?.pp}</span>
                        <span>Acc: {(bestScore?.acc*100).toFixed(2)}%</span>
                        <span>Mods: {bestScore?.mods.join("")}</span>
                        <span>Date: {new Date(bestScore?.date??"").toLocaleDateString()}</span>
                    </ScrollAnimation>
                    <div className="flex flex-col text-white p-8 text-xl">
                        <span className="text-2xl">Snipe History</span>
                        {activity.length ? activity.map((item, index) => (
                            <div className="flex space-x-1 text-base">
                                <span className="truncate">{new Date(item.time).toLocaleDateString()}:</span>
                                <a href={"/player/" + item.victimId} className="hover:underline truncate text-green-400">{item.victim}</a>
                                <span>sniped</span>
                                <a href={"/player/" + item.sniperId} className="hover:underline truncate text-red-400">{item.sniper}</a>
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