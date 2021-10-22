import axios from "axios"
import React, { useState, useEffect } from "react"
import { FormattedSnipe } from "../../../models/Snipe.model"
import { Pagination } from "./Pagination";
import { PlayerSearch } from "./PlayerSearch";
import { Player } from "../../../models/Player.model";

interface Option {
    value: string,
    label: string
}

const options: Option[] = [
    { value: "7", label: "Last Week"},
    { value: "31", label: "Last Month"},
    { value: "365", label: "Last Year"},
    { value: "99999", label: "All Time"}
]

const defaultPlayer = { name: "", id: 0, firstCount: 0 }

export const PlayerActivity = ({ id }: { id: string }) => {
    const [activity, setActivity] = useState<FormattedSnipe[]>([])
    const [pageNumber, setPageNumber] = useState(1)
    const [numberResults, setNumberResults] = useState(0)
    const [option, setOption] = useState(options[0].value)
    const [isLoading, setLoading] = useState(true)
    const [player, setPlayer] = useState<Player>(defaultPlayer)
    const pageSize = 20

    useEffect(() => {
        setLoading(true)
        axios.get("/api/activity/latestId/" + id, { params: { pageNumber, pageSize, option, playerId: player.id }}).then(res => {
            setActivity(res.data.page)
            setNumberResults(res.data.number)
            setLoading(false)
        })
    }, [pageNumber, id, pageSize, option, player])

    return (
        <div className="flex flex-col">
            <div className="flex items-center mb-4 space-x-2">
                <PlayerSearch width="w-52" height="h-8" callback={(player: Player) => {setPlayer(player)}}/>
                {player.id !== 0 && <button onClick={() => setPlayer(defaultPlayer)} className="bg-red-500 px-2 rounded-sm text-white">{player.name} x</button>}
                <select onChange={(e) => {setPageNumber(1); setOption(e.target.value)}} value={option} className="text-black border w-28 border-black">
                    {options.map(item => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                </select>
            </div>

            {!isLoading ? 
                activity.length === 0 ? 
                    <span>You haven't sniped/been sniped this week.</span> :
                    activity.map((item, index) => (
                        <div key={index} className="flex space-x-1">
                            <span className="hidden md:block truncate">{new Date(item.time).toLocaleDateString()}</span>
                            <span className={`${item.victimId === parseInt(id) ? 'text-red-400' : 'text-green-400'} truncate`}>sniped {item.victimId === parseInt(id) && 'by'}</span>
                            <a className="hover:underline" href={"/player/" + (item.victimId === parseInt(id) ? item.sniperId : item.victimId)}>{item.victimId === parseInt(id) ? item.sniper : item.victim}</a>
                            <span>on</span>
                            <a href={"/beatmap/" + item.beatmapId} target="_blank" rel="noreferrer" className="hover:underline truncate">{item.beatmap}</a>
                        </div>
                    ))
                : Array.from(Array(pageSize).keys()).map((_, index) => (
                    <span key={index}>Loading...</span>
                ))
            }   

            <Pagination isLoading={isLoading} number={numberResults} pageNumber={pageNumber} setPageNumber={setPageNumber} pageSize={pageSize} />    
        </div>
    )
}