import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import Autosuggest, { InputProps, ChangeEvent } from 'react-autosuggest'
import { useDebounce } from 'use-debounce/lib';
import { Player } from '../../../models/Player.model';

const names: Player[] = [
    { 
        name: 'YEP',
        firstCount: 1,
        id: 1,
    },
    { 
        name: 'Prendar',
        firstCount: 2,
        id: 3
    },
]

export const PlayerSearch = () => {
    const [focus, setFocus] = useState(false)
    const [isLoading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm] = useDebounce(searchTerm, 200)
    const [players, setPlayers] = useState<Player[]>([])

    useEffect(() => {
        setLoading(true)
        axios.get("/api/players", { params: { pageNumber: 1, pageSize: 5, searchTerm: debouncedSearchTerm, order: -1 } }).then(res => {
            setPlayers(res.data.players)
            setLoading(false)
        })
    }, [debouncedSearchTerm])

    return (
        <div className="w-80">
            <input onChange={(e) => setSearchTerm(e.target.value)} type="text" placeholder="Search for a player..." className="border-gray-600 border-2 w-full px-2 rounded-md h-12" onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 100)} />
            {focus &&
                <div className="absolute mt-2 flex flex-col z-20 bg-white w-80 rounded-md p-2 space-y-1 border-gray-600 border-2">
                    {players.map(item => (
                        <a href={"/player/" + item.id} className="hover:bg-blue-400 hover:text-white p-1 rounded-sm hover:cursor-pointer">
                            {item.name}
                        </a>
                    ))}
                </div>
            }
        </div>
    )
}