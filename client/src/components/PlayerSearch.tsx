import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce/lib';
import { Player } from '../../../models/Player.model';

export const PlayerSearch = ({ width, height, callback }: { width: string, height: string, callback: (player: Player) => void }) => {
    const [focus, setFocus] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm] = useDebounce(searchTerm, 200)
    const [players, setPlayers] = useState<Player[]>([])

    useEffect(() => {
        axios.get("/api/players", { params: { pageNumber: 1, pageSize: 5, searchTerm: debouncedSearchTerm, order: -1 } }).then(res => {
            setPlayers(res.data.players)
        })
    }, [debouncedSearchTerm])

    return (
        <div className={width}>
            <input onChange={(e) => setSearchTerm(e.target.value)} type="text" placeholder="Search for a player..." className={`border-gray-600 border-2 w-full px-2 rounded-md ${height}`} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 100)} />
            {focus &&
                <div className={`${width} absolute mt-2 flex flex-col z-50 bg-white rounded-md p-2 space-y-1 border-gray-600 border-2`}>
                    {players.map(item => (
                        <button onClick={() => callback(item)} className="hover:bg-blue-400 hover:text-white p-1 rounded-sm hover:cursor-pointer text-black">
                            {item.name}
                        </button>
                    ))}
                </div>
            }
        </div>
    )
}