import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { Beatmap } from '../../../models/Beatmap.model'
import { Pagination } from '../components/Pagination';

export const NoScores = () => {
    const [maps, setMaps] = useState<Beatmap[]>([])
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(20)
    const [numberNoScore, setNumberNoScore] = useState(0)

    useEffect(() => {
        axios.get("/api/beatmaps/noScoreCount").then(res => {
            setNumberNoScore(res.data)
        })
    }, [])

    useEffect(() => {
        axios.get("/api/beatmaps/noScore", { params: { pageNumber, pageSize } }).then(res => {
            setMaps(res.data)
        })  
    }, [pageSize, pageNumber])

    return (
        <div className="flex flex-col p-4">
            <a href="/" className="text-blue-400 cursor-pointer hover:underline">Home</a>
            <span className="my-4">These maps have no country scores</span>    

            {maps.map(map => (
                <div key={map.id} className="flex space-x-2">
                    <span className="w-20 truncate">{map.artist}</span>
                    <a href={"https://osu.ppy.sh/beatmaps/" + map.id} target="_blank" rel="noreferrer" className="truncate w-32 lg:w-60 text-blue-400 hover:underline">{map.song}</a>
                    <span className="w-32 truncate">[{map.difficulty}]</span>
                    <span className="w-8">{map.sr.toFixed(2)}</span>
                </div>
            ))}

            <Pagination text="Maps" number={numberNoScore} pageSize={pageSize} setPageSize={setPageSize} pageNumber={pageNumber} setPageNumber={setPageNumber}/>
        </div>
    )
}