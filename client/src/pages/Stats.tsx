import { CircularProgress } from '@material-ui/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

export const Stats = () => {
    const [isLoading, setLoading] = useState(true)
    const [contested, setContested] = useState<any[]>([])
    const [topSnipers, setTopSnipers] = useState<any[]>([])
    const [topVictims, setTopVictims] = useState<any[]>([])
    const [numberSnipes, setNumberSnipes] = useState(0)
    const [numberBeatmaps, setNumberBeatmaps] = useState(0)
    const [numberScores, setNumberScores] = useState(0)

    useEffect(() => {
        axios.get("/api/scores/stats").then(res => {
            console.log(res)
            setLoading(false)
            setTopSnipers(res.data.topSniperWeek)
            setTopVictims(res.data.topVictimWeek)
            setContested(res.data.contested)
            setNumberSnipes(res.data.snipeCount)
            setNumberBeatmaps(res.data.beatmapCount)
            setNumberScores(res.data.scoreCount)
        })
    }, [])

    return !isLoading ? (
        <div className="flex flex-col bg-grey space-y-2 p-8 items-center">
            <span className="text-4xl text-white p-4">General Stats</span>
            <div className="max-w-xl flex w-full justify-between ">
                <div className="flex flex-col bg-white p-2 lg:p-4 rounded-md items-center text-xs md:text-xl w-24 lg:w-36">
                    <span># Snipes</span>
                    <span>{numberSnipes}</span>
                </div>
                <div className="flex flex-col bg-white p-2 lg:p-4 rounded-md items-center text-xs md:text-xl w-24 lg:w-36">
                    <span># Scores</span>
                    <span>{numberScores}</span>
                </div>
                <div className="flex flex-col bg-white p-2 lg:p-4 rounded-md items-center text-xs md:text-xl w-24 lg:w-36">
                    <span># Beatmaps</span>
                    <span>{numberBeatmaps}</span>
                </div>
            </div>
            <span className="text-xl lg:text-4xl text-white p-4">Most Contested Beatmaps</span>
            {contested.map(item => (
                <div className="flex bg-gray-200 max-w-xl w-full rounded-md p-2 space-x-2 justify-between">
                    <a href={"/beatmap/" + item.beatmap.id} className="text-blue-500 hover:underline truncate">{item.beatmap.song}</a>
                    <span>{item.count}</span>
                </div>
            ))}
            <span className="text-xl lg:text-4xl text-white p-4">Weekly Snipers</span>
            {topSnipers.map(item => (
                <div className="flex bg-gray-200 max-w-xl w-full rounded-md p-2 space-x-2 justify-between">
                    <a href={"/players/" + item.player.id} className="text-blue-500 hover:underline">{item.player.name}</a>
                    <span>{item.count}</span>
                </div>
            ))}
            <span className="text-xl lg:text-4xl text-white p-4">Weekly Victims</span>
            {topVictims.map(item => (
                <div className="flex bg-gray-200 max-w-xl w-full rounded-md p-2 space-x-2 justify-between">
                    <a href={"/players/" + item.player.id} className="text-blue-500 hover:underline">{item.player.name}</a>
                    <span>{item.count}</span>
                </div>
            ))}
        </div>
    ) : <div className="w-full h-screen flex flex-col items-center justify-center">
            <CircularProgress />
        </div>
}