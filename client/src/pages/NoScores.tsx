import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { Beatmap } from '../../../models/Beatmap.model'
import { Pagination } from '../components/Pagination';

export const NoScores = () => {
    const [maps, setMaps] = useState<Beatmap[]>([])
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(20)
    const [numberNoScore, setNumberNoScore] = useState(0)
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        axios.get("/api/beatmaps/noScoreCount").then(res => {
            setNumberNoScore(res.data)
        })
    }, [])

    useEffect(() => {
        setLoading(true)
        axios.get("/api/beatmaps/noScore", { params: { pageNumber, pageSize } }).then(res => {
            setMaps(res.data)
            setLoading(false)
        })  
    }, [pageSize, pageNumber])

    const refreshMap = (id: number) => {
        setLoading(true)
        axios.post("/api/beatmaps/refresh/" + id).then(res => {
            setLoading(false)
        })
    }

    return (
        <div className="flex flex-col p-4 text-white">
            <a href="/players" className="text-blue-300 cursor-pointer hover:underline w-12">Home</a>
            <span className="my-4">These maps have no country scores</span>    

            {!isLoading ? maps.map(map => (
                <div key={map.id} className="flex space-x-2">
                    <span className="w-20 truncate">{map.artist}</span>
                    <a href={"https://osu.ppy.sh/beatmaps/" + map.id} target="_blank" rel="noreferrer" className="truncate w-32 lg:w-60 text-blue-300 hover:underline">{map.song}</a>
                    <span className="w-32 truncate">[{map.difficulty}]</span>
                    <span className="w-8">{map.sr.toFixed(2)}</span>
                    <button onClick={() => refreshMap(map.id)} className="w-24 text-blue-300 hover:underline">Refresh</button>
                </div>
            )) : <span>Loading...</span>}

            <Pagination text="Maps" number={numberNoScore} pageSize={pageSize} setPageSize={setPageSize} pageNumber={pageNumber} setPageNumber={setPageNumber}/>
        </div>
    )
}