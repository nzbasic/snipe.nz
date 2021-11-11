import { CircularProgress } from '@material-ui/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

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
        <div className="flex flex-col bg-grey space-y-1 p-8 items-center text-white">
            <Helmet>
                <meta property="og:title" content="Stats about NZ country #1s" />
                <meta property="og:description" content="See statistics about the most contested beatmaps and the most snipes/sniped person this week." />
                <meta property="og:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
                <meta name="twitter:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
                <meta name="twitter:title" content="Stats about NZ country #1s" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:description" content="See statistics about the most contested beatmaps and the most snipes/sniped person this week." />
            </Helmet>
            <span className="text-4xl text-white p-4">General Stats</span>
            <div className="max-w-xl flex w-full justify-between text-white">
                <div className="flex flex-col p-2 lg:p-4 items-center text-xs md:text-xl w-24 lg:w-36">
                    <span>{numberSnipes}</span>
                    <span>Snipes</span>
                </div>
                <div className="flex flex-col p-2 lg:p-4 items-center text-xs md:text-xl w-24 lg:w-36">
                    <span>{numberScores}</span>
                    <span>Scores</span>
                </div>
                <div className="flex flex-col p-2 lg:p-4 items-center text-xs md:text-xl w-24 lg:w-36">
                    <span>{numberBeatmaps}</span>
                    <span>Beatmaps</span>
                </div>
            </div>
            <span className="text-xl lg:text-4xl p-4">Most Contested Beatmaps</span>
            {contested.map(item => (
                <div className="flex bg-gray-700 max-w-xl w-full rounded p-2 space-x-2 justify-between">
                    <Link to={"/beatmap/" + item.beatmap.id} className="text-blue-300 hover:underline truncate">{item.beatmap.song}</Link>
                    <span>{item.count}</span>
                </div>
            ))}
            <span className="text-xl lg:text-4xl p-4">Weekly Snipers</span>
            {topSnipers.map(item => (
                <div className="flex bg-gray-700 max-w-xl w-full rounded p-2 space-x-2 justify-between">
                    <Link to={"/player/" + item.player.id} className="text-blue-300 hover:underline">{item.player.name}</Link>
                    <span>{item.count}</span>
                </div>
            ))}
            <span className="text-xl lg:text-4xl p-4">Weekly Victims</span>
            {topVictims.map(item => (
                <div className="flex bg-gray-700 max-w-xl w-full rounded p-2 space-x-2 justify-between">
                    <Link to={"/player/" + item.player.id} className="text-blue-300 hover:underline">{item.player.name}</Link>
                    <span>{item.count}</span>
                </div>
            ))}
        </div>
    ) : <div className="w-full h-screen flex flex-col items-center justify-center">
            <CircularProgress />
        </div>
}