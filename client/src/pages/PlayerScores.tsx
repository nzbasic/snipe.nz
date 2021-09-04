import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom'
import { Play } from '../../../models/play'
import axios from 'axios'
import { Player } from '../../../models/Player.model';
import NumberFormat from 'react-number-format'
import { Pagination } from '../components/Pagination'

export const PlayerScores = (props: RouteComponentProps<{ id: string }>) => {
    const [plays, setPlays] = useState<Play[]>([])
    const [numberPlays, setNumberPlays] = useState(0)
    const [pageNumber, setPageNumber] = useState(1)
    const [player, setPlayer] = useState<Player>({ id: 0, name: "", firstCount: 0})
    const [isLoading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(20)
    const id = props.match.params.id

    useEffect(() => {
        axios.get("/api/players/" + id).then(res => {
            setPlayer(res.data)
        })
    }, [id])

    useEffect(() => {
        setLoading(true)
        axios.get("/api/scores", { params: { id, pageNumber, pageSize } }).then(res => {
            setNumberPlays(res.data.numberPlays)
            setPlays(res.data.plays)
            setLoading(false)
        })
    }, [pageNumber, pageSize, id])

    const refreshUser = () => {
        setLoading(true)
        axios.post("/api/players/refresh/" + id).then(res => {
            setLoading(false)
            setPageNumber(1)
        })
    }

    const refreshMap = (id: number) => {
        setLoading(true)
        axios.post("/api/beatmaps/refresh/" + id).then(res => {
            setLoading(false)
            setPageNumber(1)
        })
    }

    return (
      <div className="flex flex-col p-4 text-white">
        <a href="/players" className="text-blue-300 cursor-pointer hover:underline w-12">Home</a>
        <div className="flex space-x-4 my-4 items-center">
            <a href={"https://osu.ppy.sh/users/" + player.id} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">{player.name}</a>
            <button disabled={isLoading} onClick={() => refreshUser()} className={`${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-800'}  text-white px-2 py-1`}>Refresh using last 50 plays (1 minute)</button>
        </div>

        {!isLoading ? plays.map((play, index) => (
            <div key={play.id} className="flex text-xs lg:text-base space-x-2">
                <span className="w-8">{(index+1) + ((pageNumber-1) * pageSize)}</span>
                <span className="w-16 lg:w-28 truncate">{play.artist}</span>
                <a href={"https://osu.ppy.sh/beatmaps/" + play.beatmapId} target="_blank" rel="noreferrer" className="truncate w-32 lg:w-60 text-blue-300 hover:underline">{play.song}</a>
                <span className="w-20 lg:w-40 truncate">[{play.difficulty}]</span>
                <NumberFormat className="w-24" value={play.score} displayType={'text'} thousandSeparator={true}/>
                <span className="w-12 lg:w-16">{(play.pp??0).toFixed(0)}pp</span>
                <span className="w-16 hidden lg:block">{(play.acc*100).toFixed(2)}%</span>
                <span className="w-20 hidden lg:block truncate">{play.mods.join("")}</span>
                <a href={"https://osu.ppy.sh/scores/osu/" + play.id} target="_blank" rel="noreferrer" className="w-8 truncate text-blue-300 hover:underline">Link</a>
                <button onClick={() => refreshMap(play.beatmapId)} className="text-blue-300 w-24 hover:underline">Refresh</button>
            </div>
        )) : "loading..."}

        <Pagination text="Plays" number={numberPlays} pageSize={pageSize} setPageSize={setPageSize} pageNumber={pageNumber} setPageNumber={setPageNumber}/> 
      </div>

      
    );
}

