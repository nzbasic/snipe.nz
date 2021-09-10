import { CircularProgress } from '@material-ui/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

export const Stats = () => {
    const [isLoading, setLoading] = useState(true)
    const [contested, setContested] = useState<any[]>([])
    const [topSnipers, setTopSnipers] = useState<any[]>([])
    const [topVictims, setTopVictims] = useState<any[]>([])

    useEffect(() => {
        axios.get("/api/scores/stats").then(res => {
            console.log(res)
            setLoading(false)
            setTopSnipers(res.data.topSniperWeek)
            setTopVictims(res.data.topVictimWeek)
            setContested(res.data.contested)
        })
    }, [])

    return !isLoading ? (
        <div className="flex flex-col bg-grey space-y-2 p-8 items-center">
            <span className="text-4xl text-white">Most Contested Beatmaps</span>
            {contested.map(item => (
                <div className="flex bg-gray-200 max-w-3xl w-full rounded-md p-2 space-x-2 justify-between">
                    <a href={"/beatmap/" + item.beatmap.id} className="text-blue-500 hover:underline">{item.beatmap.song}</a>
                    <span>{item.count}</span>
                </div>
            ))}
            <span className="text-4xl text-white pt-4">Most Snipes This Week</span>
            {topSnipers.map(item => (
                <div className="flex bg-gray-200 max-w-3xl w-full rounded-md p-2 space-x-2 justify-between">
                    <a href={"/players/" + item.player.id} className="text-blue-500 hover:underline">{item.player.name}</a>
                    <span>{item.count}</span>
                </div>
            ))}
            <span className="text-4xl text-white pt-4">Most Victims This Week</span>
            {topVictims.map(item => (
                <div className="flex bg-gray-200 max-w-3xl w-full rounded-md p-2 space-x-2 justify-between">
                    <a href={"/players/" + item.player.id} className="text-blue-500 hover:underline">{item.player.name}</a>
                    <span>{item.count}</span>
                </div>
            ))}
        </div>
    ) : <CircularProgress />
}