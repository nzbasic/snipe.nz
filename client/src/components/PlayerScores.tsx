import axios from "axios"
import { useEffect, useState } from "react"
import NumberFormat from "react-number-format"
import { Play } from "../../../models/play"
import { Pagination } from "./Pagination"

const options = [
    { value: "score", label: "Score"},
    { value: "date", label: "Date"},
    { value: "acc", label: "Accuracy"},
    { value: "pp", label: "pp"}
]

export const PlayerScores = ({ id }: { id: string }) => {
    const [isLoading, setLoading] = useState(true)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [numberPlays, setNumberPlays] = useState(0)
    const [plays, setPlays] = useState<Play[]>([])
    const [sortBy, setSortBy] = useState("pp")
    const [sortOrder, setSortOrder] = useState("desc")

    const refreshMap = (id: number) => {
        setLoading(true)
        axios.post("/api/beatmaps/refresh/" + id).then(res => {
            setLoading(false)
            setPageNumber(1)
        })
    }

    useEffect(() => {
        setLoading(true)
        axios.get("/api/scores", { params: { id, pageNumber, pageSize, sortBy, sortOrder } }).then(res => {
            setNumberPlays(res.data.numberPlays)
            setPlays(res.data.plays)
            setLoading(false)
        })
    }, [pageNumber, pageSize, id, sortBy, sortOrder])

    return (
        <div className="flex flex-col">
            <div className="flex items-center mb-4 space-x-2">
                <span>Sort by:</span>
                <select onChange={(e) => {setPageNumber(1); setSortBy(e.target.value)}} value={sortBy} className="text-black border border-black">
                    {options.map(item => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                </select>
                <span>Order:</span>
                <select onChange={(e) => {setPageNumber(1); setSortOrder(e.target.value)}} value={sortOrder} className="text-black border border-black">
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                </select>
            </div>
            {!isLoading ? plays.map((play, index) => (
                <div key={play.id} className="flex space-x-2">
                    <span className="w-8">{(index+1) + ((pageNumber-1) * pageSize)}</span>
                    <span className="w-16 lg:w-28 truncate">{play.artist}</span>
                    <a href={"https://osu.ppy.sh/beatmaps/" + play.beatmapId} target="_blank" rel="noreferrer" className="truncate w-32 lg:w-60 text-blue-400 hover:underline">{play.song}</a>
                    <span className="w-20 lg:w-40 truncate">[{play.difficulty}]</span>
                    <NumberFormat className="w-24 hidden md:block" value={play.score} displayType={'text'} thousandSeparator={true}/>
                    <span className="hidden md:block w-12 lg:w-16">{(play.pp??0).toFixed(0)}pp</span>
                    <span className="w-16 hidden lg:block">{(play.acc*100).toFixed(2)}%</span>
                    <span className="w-20 hidden lg:block truncate">{play.mods.join("")}</span>
                    <a href={"https://osu.ppy.sh/scores/osu/" + play.id} target="_blank" rel="noreferrer" className="w-8 truncate text-blue-400 hover:underline">Link</a>
                    <button onClick={() => refreshMap(play.beatmapId)} className="hidden md:block text-blue-400 w-24 hover:underline">Refresh</button>
                </div>
            )) : Array.from(Array(pageSize).keys()).map((_, index) => (
                <div key={index} className="flex space-x-2">
                    <span className="w-8">{(index+1) + ((pageNumber-1) * pageSize)}</span>
                    <span>Loading...</span>
                </div>
            ))
            }
            <Pagination isLoading={isLoading} text="Plays" number={numberPlays} pageSize={pageSize} setPageSize={setPageSize} pageNumber={pageNumber} setPageNumber={setPageNumber}/> 
        </div>
    )
}