import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { FormattedSnipe } from '../../../models/Snipe.model'

export const Activity = () => {
    const [isLoading, setLoading] = useState(true)
    const [snipes, setSnipes] = useState<FormattedSnipe[]>([])
    const numberShown = 50;
    
    useEffect(() => {
        axios.get("/api/activity/latest/" + numberShown).then(res => {
            setSnipes(res.data)
            setLoading(false)
        })
    }, [])

    return (
        <div className="flex flex-col w-full items-center bg-gray-900 h-max">
            
            <div className="flex flex-col text-white text-xs md:text-xl lg:text-2xl xl:text-3xl space-y-1 my-8 lg:my-16">
                <span className="text-3xl md:text-6xl">Latest Snipes:</span>
                {!isLoading ? (
                    snipes.map((item, index) => (
                        <div key={index} className="flex flex-row lg:max-w-7xl items-center space-x-1 lg:space-x-2">
                            <span className="hidden md:block truncate">{new Date(item.time).toLocaleString()}:</span>
                            <a href={"/player/" + item.sniperId} className="hover:underline truncate">{item.sniper}</a>
                            <span>sniped</span>
                            <a href={"/player/" + item.victimId} className="hover:underline truncate">{item.victim}</a>
                            <span>on</span>
                            <a href={"https://osu.ppy.sh/beatmaps/" + item.beatmapId} target="_blank" rel="noreferrer" className="hover:underline truncate">{item.beatmap}</a>
                        </div>
                    ))
                ) : <span>Loading Activity...</span>}
            </div>
        </div>
    )
}