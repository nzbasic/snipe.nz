import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Player } from '../../../models/Player.model'
import { useDebounce } from 'use-debounce'
import { Pagination } from '../components/Pagination';
import ScrollAnimation from 'react-animate-on-scroll';
import { PlayerSearch } from '../components/PlayerSearch';
import { Footer } from '../components/Footer';

const loadingData: Player[] = []

for (let i = 0; i < 100; i++) {
    loadingData.push({ name: "Loading...", id: 0, firstCount: 0 })
}

export const Leaderboard = () => {
    const [isLoading, setLoading] = useState(true)
    const [players, setPlayers] = useState<Player[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [numberLoaded, setNumberLoaded] = useState(0);
    const [numberPlayers, setNumberPlayers] = useState(0);
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm] = useDebounce(searchTerm, 200)
    const [pageSize, setPageSize] = useState(100)
    const order = -1;

    useEffect(() => {
        window.document.title = "Leaderboard"

        axios.get("/api/beatmaps/numberLoaded").then(res => {
            setNumberLoaded(res.data)
        })
    }, [])

    useEffect(() => {
        setPageNumber(1)
    }, [debouncedSearchTerm])

    useEffect(() => {
        setLoading(true)
        axios.get("/api/players", { params: { pageNumber, pageSize, searchTerm: debouncedSearchTerm, order } }).then(res => {
            setPlayers(res.data.players)
            setNumberPlayers(res.data.numberPlayers)
            setLoading(false)
        })
    }, [pageNumber, pageSize, debouncedSearchTerm, order])

    const placing = (index: number, pageNumber: number) => {
        if (pageNumber === 1) {
            if (index === 0) {
                return 'bg-yellow-300'
            } else if (index === 1) {
                return 'bg-gray-400'
            } else if (index === 2) {
                return 'bg-yellow-500'
            }
        }
    }

    return (
        <div className="flex flex-col text-white">
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-pink-400 flex items-center justify-center w-full p-8 text-black z-20">
                <PlayerSearch width="w-80" height="h-12" callback={(player: Player) => {window.location.href="/player/" + player.id}}/>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInRight" className="bg-black flex flex-col items-center p-8 space-y-1">
                <div className="mb-4">
                    <Pagination number={numberPlayers} pageNumber={pageNumber} setPageNumber={setPageNumber}/> 
                </div>
                {!isLoading ? players.map((player, index) => (
                    <div key={player.id} className={`${placing(index, pageNumber)} w-full max-w-3xl flex flex-row bg-gray-200 rounded-md p-2 justify-between text-black`}>
                        <div className="flex">
                            <span className="mr-4">{(index+1) + ((pageNumber-1) * pageSize)}</span>
                            <a href={"/player/" + player.id} className="w-40 text-blue-700 hover:underline">{player.name}</a>
                        </div>
                        <span className="w-12">{player.firstCount}</span>
                    </div>
                )) : loadingData.map((item, index) => (
                    <div className="w-full max-w-3xl flex bg-white rounded-md p-2 justify-between text-black">
                        <div className="flex">
                            <span className="mr-4">{(index+1) + ((pageNumber-1) * pageSize)}</span>
                            <span className="w-40">Loading...</span>
                        </div>
                        <span className="w-12">0</span>
                    </div>
                ))}
            </ScrollAnimation>
            <Footer />
        </div>
    );
}
