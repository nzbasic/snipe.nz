import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { FormattedSnipe } from '../../../models/Snipe.model'
import { SingleActivity } from '../components/SingleActivity'

export const Activity = () => {
    const [isLoading, setLoading] = useState(true)
    const [snipes, setSnipes] = useState<FormattedSnipe[]>([])
    const numberShown = 50;
    
    useEffect(() => {
        window.document.title = "Activity"

        axios.get("/api/activity/latest/" + numberShown).then(res => {
            setSnipes(res.data)
            setLoading(false)
        })
    }, [])

    return (
        <div className="flex flex-col w-full items-center bg-gray-900 h-max">
            
            <div className="flex flex-col text-white text-xs md:text-xl lg:text-2xl xl:text-3xl space-y-1 my-8 lg:my-16">
                <span className="text-3xl md:text-6xl">Latest {numberShown} Snipes:</span>
                {!isLoading ? (
                    snipes.map((item, index) => (
                        <SingleActivity key={index} snipe={item}/>
                    ))
                ) : <span>Loading Activity...</span>}
            </div>
        </div>
    )
}