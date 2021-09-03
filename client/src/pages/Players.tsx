import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Player } from '../../../models/Player.model'
import { useDebounce } from 'use-debounce'

export const Players = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [numberLoaded, setNumberLoaded] = useState(0);
    const [numberPlayers, setNumberPlayers] = useState(0);
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm] = useDebounce(searchTerm, 200)
    const [pageSize, setPageSize] = useState(20)
    const order = -1;

    useEffect(() => {
        axios.get("/api/beatmaps/numberLoaded").then(res => {
            setNumberLoaded(res.data)
        })
    }, [])

    useEffect(() => {
        axios.get("/api/players", { params: { pageNumber, pageSize, searchTerm: debouncedSearchTerm, order } }).then(res => {
            setPlayers(res.data.players)
            setNumberPlayers(res.data.numberPlayers)
        })
    }, [pageNumber, pageSize, debouncedSearchTerm, order])

    return (
        <div className="flex flex-col p-4">
            <h1>I'll make it look good later</h1>
            <span>{numberLoaded} Beatmaps loaded / ~86000</span>
            <input className="border-2 w-60 border-black my-4" type="text" placeholder="Search" onChange={(e) => setSearchTerm(e.target.value)} />
            <div className="flex flex-row">
                <span className="w-12">#</span>
                <span className="w-40">Name</span>
                <span>Number of Country #1s</span>
            </div>
            {players.map((player, index) => (
                <div key={player.id} className="flex flex-row">
                    <span className="w-12">{(index+1) + ((pageNumber-1) * pageSize)}</span>
                    <a href={"/player/" + player.id} className="w-40 text-blue-400 hover:underline">{player.name}</a>
                    <span>{player.firstCount}</span>
                </div>
            ))}
            <div className="flex space-x-4 items-center mt-4">
                <span>{numberPlayers} Players</span>
                <button onClick={() => setPageNumber(pageNumber-1)} disabled={pageNumber === 1} className={`${pageNumber === 1 ? 'bg-blue-400 cursor-default': 'bg-blue-600'} px-2 py-1 rounded-sm text-white`}>Prev</button>
                <button onClick={() => setPageNumber(pageNumber+1)} disabled={pageNumber*pageSize > numberPlayers} className={`${pageNumber*pageSize > numberPlayers ? 'bg-blue-400 cursor-default': 'bg-blue-600'} px-2 py-1 rounded-sm text-white`}>Next</button>
                <select onChange={(e) => setPageSize(parseInt(e.target.value))} value={pageSize} className="border-2 border-black">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="500">500</option>
                </select>
            </div>
        </div>
    );
}
