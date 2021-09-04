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
            <div className="flex flex-col text-white text-3xl py-32">
                {!isLoading ? (
                    snipes.map((item, index) => (
                        <div key={index} className="flex flex-row space-y-2 truncate">
                            <span>{new Date(item.time).toLocaleString()}: {item.sniper} sniped {item.victim} on {item.beatmap}</span>
                        </div>
                    ))
                ) : <span>Loading...</span>}
            </div>
        </div>
    )
}