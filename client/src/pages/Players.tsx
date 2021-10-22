import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Player } from '../../../models/Player.model'
import { useDebounce } from 'use-debounce'
import { Pagination } from '../components/Pagination';
import ScrollAnimation from 'react-animate-on-scroll';
import { PlayerSearch } from '../components/PlayerSearch';
import { Footer } from '../components/Footer';
import { Helmet } from 'react-helmet';

enum Mode {
    NUMBER_ONES = "Number of #1s",
    SNIPER = "Snipes",
    VICTIM = "Times sniped"
}

interface PlayerStat {
    name: string,
    count: number,
    id: number
}

export const Leaderboard = () => {
    const [mode, setMode] = useState(Mode.NUMBER_ONES);
    const [isLoading, setLoading] = useState(true)
    const [players, setPlayers] = useState<PlayerStat[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [numberPlayers, setNumberPlayers] = useState(0);
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm] = useDebounce(searchTerm, 200)
    const pageSize = 100
    const order = -1;
    let modeNumber = useRef(1);

    useEffect(() => {
        window.document.title = "Leaderboard"
    }, [])

    useEffect(() => {
        setPageNumber(1)
    }, [debouncedSearchTerm])

    useEffect(() => {
        setLoading(true)
        const stats: PlayerStat[] = []

        if (mode === Mode.VICTIM || mode === Mode.SNIPER) {
            const isSniper = mode === Mode.SNIPER
            axios.get("/api/activity/topSniped", { params: { isSniper, pageNumber, pageSize }}).then(res => {
                for (const snipeData of res.data.page) {
                    stats.push({
                        name: snipeData.player.name,
                        count: snipeData.count,
                        id: snipeData.player.id
                    })
                }

                setPlayers(stats)
                setNumberPlayers(res.data.number)
                setLoading(false)
            })
        } else {
            axios.get("/api/players", { params: { pageNumber, pageSize, searchTerm: debouncedSearchTerm, order } }).then(res => {
                for (const player of res.data.players) {
                    stats.push({
                        name: player.name,
                        count: player.firstCount,
                        id: player.id
                    })
                }

                setPlayers(stats)
                setNumberPlayers(res.data.numberPlayers)
                setLoading(false)
            })
        }
    }, [pageNumber, pageSize, debouncedSearchTerm, order, mode])

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

    const changeMode = (index: number) => {
        const number = modeNumber.current + index
        setPageNumber(1)
        if (number === 0) { 
            setMode(Mode.VICTIM)
        } else if (number === 1) {
            setMode(Mode.NUMBER_ONES)
        } else if (number === 2) {
            setMode(Mode.SNIPER)
        }
        modeNumber.current = number;
    }

    return (
        <div className="flex flex-col text-white">
            <Helmet>
                <meta property="og:title" content="NZ country #1 leaderboard" />
                <meta property="og:description" content="See who has the most #1s, most snipes, and who is sniped the most." />
                <meta property="og:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
                <meta name="twitter:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
                <meta name="twitter:title" content="NZ country #1 leaderboard" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:description" content="See who has the most #1s, most snipes, and who is sniped the most." />
            </Helmet>
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-pink-400 flex items-center justify-center w-full p-8 text-black z-20">
                <PlayerSearch width="w-80" height="h-12" callback={(player: Player) => {window.location.href="/player/" + player.id}}/>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInRight" className="bg-black flex flex-col items-center p-8 space-y-1">
                <div className="flex space-x-4 text-4xl items-center">
                    <button className={`${mode === Mode.VICTIM && 'invisible'} w-8`} onClick={() => changeMode(-1)}>←</button>
                    <span className="w-72 text-center">{mode}</span>
                    <button className={`${mode === Mode.SNIPER && 'invisible'} w-8`} onClick={() => changeMode(1)}>→</button>
                </div>
                <div className="py-4">
                    <Pagination isLoading={isLoading} number={numberPlayers} pageNumber={pageNumber} setPageNumber={setPageNumber}/> 
                </div>
                {!isLoading ? players.map((player, index) => (
                    <div key={player.id} className={`${placing(index, pageNumber)} w-full max-w-3xl flex flex-row bg-gray-100 rounded-md p-2 justify-between text-black`}>
                        <div className="flex">
                            <span className="mr-4">{(index+1) + ((pageNumber-1) * pageSize)}</span>
                            <a href={"/player/" + player.id} className="w-40 text-blue-700 hover:underline">{player.name}</a>
                        </div>
                        <span className="w-12">{player.count}</span>
                    </div>
                )) : Array.from(Array(pageSize).keys()).map((item, index) => (
                    <div key={index} className="w-full max-w-3xl flex bg-white rounded-md p-2 justify-between text-black">
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
