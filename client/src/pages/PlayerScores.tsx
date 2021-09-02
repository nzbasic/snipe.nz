import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom'
import { Play } from '../../../models/play'
import axios from 'axios'
import { Player } from '../../../models/Player.model';

export const PlayerScores = (props: RouteComponentProps<{ id: string }>) => {
    const [plays, setPlays] = useState<Play[]>([])
    const [numberPlays, setNumberPlays] = useState(0)
    const [pageNumber, setPageNumber] = useState(1)
    const [player, setPlayer] = useState<Player>({ id: 0, name: "", firstCount: 0})
    const [isLoading, setLoading] = useState(true)
    const pageSize = 20;
    const id = props.match.params.id

    useEffect(() => {
        axios.get("http://localhost:8080/api/players/" + id).then(res => {
            setPlayer(res.data)
        })
    }, [id])

    useEffect(() => {
        setLoading(true)
        axios.get("http://localhost:8080/api/scores", { params: { id, pageNumber, pageSize } }).then(res => {
            setNumberPlays(res.data.numberPlays)
            setPlays(res.data.plays)
            setLoading(false)
        })
    }, [pageNumber, pageSize, id])

    return (
      <div className="flex flex-col p-4">
        <a href="/" className="text-blue-400 cursor-pointer hover:underline">Home</a>
        <div className="flex space-x-4 my-4">
            <a href={"https://osu.ppy.sh/users/" + player.id} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{player.name}</a>
        </div>
        {!isLoading ? plays.map(play => (
            <div key={play.id} className="flex text-xs lg:text-base space-x-2">
                <span className="w-16 lg:w-28 truncate">{play.artist}</span>
                <a href={"https://osu.ppy.sh/beatmaps/" + play.beatmapId} target="_blank" rel="noreferrer" className="truncate w-32 lg:w-60 text-blue-400 hover:underline">{play.title}</a>
                <span className="w-20 lg:w-40 truncate">[{play.difficulty}]</span>
                <span className="w-12 lg:w-20">{play.pp.toFixed(0)}pp</span>
                <span className="w-20 hidden lg:block">{(play.acc*100).toFixed(2)}%</span>
                <span className="w-20 hidden lg:block">{play.mods.join("")}</span>
                <a href={"https://osu.ppy.sh/scores/osu/" + play.id} target="_blank" rel="noreferrer" className="w-8 truncate text-blue-400 hover:underline">Link</a>
            </div>
            
        )) : "loading..."}

        <div className="flex space-x-4 items-center mt-4">
            <span>{numberPlays} Plays</span>
            <button onClick={() => setPageNumber(pageNumber-1)} disabled={pageNumber === 1} className={`${pageNumber === 1 ? 'bg-blue-400 cursor-default': 'bg-blue-600'} px-2 py-1 rounded-sm text-white`}>Prev</button>
            <button onClick={() => setPageNumber(pageNumber+1)} disabled={pageNumber*pageSize > numberPlays} className={`${pageNumber*pageSize > numberPlays ? 'bg-blue-400 cursor-default': 'bg-blue-600'} px-2 py-1 rounded-sm text-white`}>Next</button>
        </div>
      </div>

      
    );
}

