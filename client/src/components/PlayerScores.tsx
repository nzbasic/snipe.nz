import axios from "axios"
import { useEffect, useState } from "react"
import NumberFormat from "react-number-format"
import { Play } from "../../../models/play"
import { Pagination } from "./Pagination"
import fileDownloader from 'js-file-download'
import { CircularProgress, makeStyles } from "@material-ui/core"
import { SortingDropdown } from './SortingDropdown'

const useStyles = makeStyles((theme) => ({
    loading: {
      color: "white"
    }
}));

export const PlayerScores = ({ id, name }: { id: string, name: string }) => {
    const [isLoading, setLoading] = useState(true)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [numberPlays, setNumberPlays] = useState(0)
    const [plays, setPlays] = useState<Play[]>([])
    const [sortBy, setSortBy] = useState("pp")
    const [sortOrder, setSortOrder] = useState("desc")
    const [exportLoading, setExportLoading] = useState(false)
    const classes = useStyles()

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

    const exportCollection = () => {
        setExportLoading(true)
        axios.get("/api/scores/export/" + id, { responseType: "arraybuffer" }).then(res => {
            setExportLoading(false)
            fileDownloader(res.data, name + ".db")
        })
    }

    return (
        <div className="flex flex-col">
            <div className="hidden lg:flex items-center mb-4 space-x-2">
                <button disabled={exportLoading} className={`${exportLoading ? 'bg-blue-400 cursor-default' : 'bg-blue-600 hover:bg-blue-700'} px-2 py-1 w-72 text-white rounded-sm `} onClick={() => exportCollection()}>
                    {!exportLoading ? 
                        <span>Export to Collection Helper .db file</span> :
                        <CircularProgress size={15} className={classes.loading}/>
                    }
                </button>
                <a href="https://github.com/nzbasic/Collection-Helper" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Download Collection Helper</a>
            </div>
            <SortingDropdown setPageNumber={setPageNumber} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder}/>
            {!isLoading ? plays.map((play, index) => (
                <div key={play.id} className="flex space-x-2">
                    <span className="w-8">{(index+1) + ((pageNumber-1) * pageSize)}</span>
                    <span className="w-16 lg:w-28 truncate">{play.artist}</span>
                    <a href={"/beatmap/" + play.beatmapId} className="truncate w-32 lg:w-60 text-blue-400 hover:underline">{play.song}</a>
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
            ))}
            <Pagination isLoading={isLoading} text="Plays" number={numberPlays} pageSize={pageSize} setPageSize={setPageSize} pageNumber={pageNumber} setPageNumber={setPageNumber}/> 
        </div>
    )
}