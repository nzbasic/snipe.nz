import { useEffect, useState } from "react"
import ScrollAnimation from "react-animate-on-scroll"
import { InputText } from '../components/InputText';
import { MinMax } from '../components/MinMax'
import { MinMaxData, QueryData } from '../../../models/query'
import { ModSelect } from '../components/ModSelect'
import axios from "axios";
import { Pagination } from "../components/Pagination";
import { Play } from "../../../models/play";
import { ScoreTable } from "../components/ScoreTable";
import hash from 'object-hash'
import fileDownloader from 'js-file-download'
import { SortingDropdown } from "../components/SortingDropdown";
import { CircularProgress, makeStyles } from "@material-ui/core";
import { Helmet } from "react-helmet";

const useStyles = makeStyles((theme) => ({
    loading: {
      color: "white"
    }
}));

export const Query = () => {
    const [artist, setArtist] = useState("")
    const [title, setTitle] = useState("")
    const [difficulty, setDifficulty] = useState("")
    const [bpm, setBpm] = useState<MinMaxData>({ min: 0, max: 0, changedMin: false, changedMax: false })
    const [ar, setAr] = useState<MinMaxData>({ min: 0, max: 0, changedMin: false, changedMax: false })
    const [cs, setCs] = useState<MinMaxData>({ min: 0, max: 0, changedMin: false, changedMax: false })
    const [hp, setHp] = useState<MinMaxData>({ min: 0, max: 0, changedMin: false, changedMax: false })
    const [od, setOd] = useState<MinMaxData>({ min: 0, max: 0, changedMin: false, changedMax: false })
    const [sr, setSr] = useState<MinMaxData>({ min: 0, max: 0, changedMin: false, changedMax: false })
    const [length, setLength] = useState<MinMaxData>({ min: 0, max: 0, changedMin: false, changedMax: false })
    const [rankedMin, setRankedMin] = useState(0)
    const [rankedMax, setRankedMax] = useState(0)
    const [noSpinners, setNoSpinners] = useState(true)
    const [player, setPlayer] = useState("")
    const [combo, setCombo] = useState<MinMaxData>({ min: 0, max: 0, changedMin: false, changedMax: false })
    const [misses, setMisses] = useState<MinMaxData>({ min: 0, max: 0, changedMin: false, changedMax: false })
    const [pp, setPp] = useState<MinMaxData>({ min: 0, max: 0, changedMin: false, changedMax: false })
    const [acc, setAcc] = useState<MinMaxData>({ min: 0, max: 0, changedMin: false, changedMax: false })
    const [modsInclude, setModsInclude] = useState<string[]>([])
    const [modsExclude, setModsExclude] = useState<string[]>([])
    const [dateMin, setDateMin] = useState(0)
    const [dateMax, setDateMax] = useState(0)
    const [pageSize, setPageSize] = useState(50)
    const [pageNumber, setPageNumber] = useState(1)
    const [isCacheLoading, setCacheLoading] = useState(true)
    const [isPageLoading, setPageLoading] = useState(true)
    const [numberResults, setNumberResults] = useState(0)
    const [hashes, setHashes] = useState<string[]>([])
    const [data, setData] = useState<Play[]>([])
    const [query, setQuery] = useState<QueryData>()
    const [sortBy, setSortBy] = useState("pp")
    const [sortOrder, setSortOrder] = useState("desc")
    const [exportLoading, setExportLoading] = useState(false)
    const classes = useStyles();

    useEffect(() => {
        const interval = setInterval(() => {
            axios.get("/api/beatmaps/loading/").then(res => {
                if (!res.data) {
                    setCacheLoading(false)
                    clearInterval(interval)
                }
            })
        }, 1000)
        
    }, [])

    const printQuery = () => {
        const query: QueryData = {
            artist: artist,
            title: title,
            difficulty: difficulty,
            bpm: bpm,
            ar: ar,
            cs: cs,
            hp: hp,
            od: od,
            sr: sr,
            length: length,
            rankedMin,
            rankedMax,
            player: player,
            combo: combo,
            misses: misses,
            pp: pp,
            acc: acc,
            dateMin,
            dateMax,
            modsInclude: modsInclude,
            modsExclude: modsExclude,
            noSpinners
        }

        setQuery(query)
        setPageLoading(true)
    }

    useEffect(() => {
        if (query) {
            axios.post("/api/beatmaps/query/", { body: { query, pageNumber, pageSize, sortBy, sortOrder, toExport: false }}).then(res => {
                setHashes(res.data.hashes)
                setData(res.data.page)
                setNumberResults(res.data.numberResults)
                setPageLoading(false)
            })
        }
        
    }, [query, pageNumber, pageSize, sortBy, sortOrder])

    const exportToDb = () => {
        setExportLoading(true)
        axios.post("/api/beatmaps/query/", { body: { query, pageNumber, pageSize, toExport: true }}, { responseType: "arraybuffer" }).then(res => {
            setExportLoading(false)
            fileDownloader(res.data, hash(query??{}) + ".db")
        })
    }

    return (
        <div className="flex flex-col text-xs lg:text-xl">
            <Helmet>
                <meta property="og:title" content="NZ country #1 query page" />
                <meta property="og:description" content="Search through NZ country #1 scores and export them to your osu! collections." />
                <meta property="og:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
                <meta name="twitter:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
                <meta name="twitter:title" content="NZ country #1 query page" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:description" content="Search through NZ country #1 scores and export them to your osu! collections." />
            </Helmet>
            <div className="bg-purple-700 text-white  flex flex-col p-8 w-full space-y-2">
                <span className="text-2xl pb-2">Map Details (All inputs are optional)</span>
                <InputText text="Artist" onChange={setArtist} />
                <InputText text="Title" onChange={setTitle} />
                <InputText text="Difficulty" onChange={setDifficulty} />
                <div className="flex items-center space-x-2">
                    <span className="w-32">Ranked Min:</span>
                    <input type="date" className="text-black w-64 lg:w-56  rounded-sm border-gray-400 border-2 px-2" onChange={(e) => setRankedMin(e.target.valueAsNumber)}/>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-32">Ranked Max:</span>
                    <input type="date" className="text-black w-64 lg:w-56  rounded-sm border-gray-400 border-2 px-2" onChange={(e) => setRankedMax(e.target.valueAsNumber)}/>
                </div>
                <MinMax text="BPM" update={setBpm} />
                <MinMax text="AR" update={setAr} />
                <MinMax text="OD" update={setOd} />
                <MinMax text="CS" update={setCs} />
                <MinMax text="HP" update={setHp} />
                <MinMax text="Stars" update={setSr} />
                <MinMax text="Drain" update={setLength} />
                
                <div className="flex items-center space-x-2">
                    <span>Include maps with no spinners?</span>
                    <input checked={noSpinners} type="checkbox" onChange={e => setNoSpinners(e.target.checked)} />
                </div>
            </div>
            <div className="bg-black text-white flex flex-col p-8 w-full space-y-2">
            <span className="text-2xl py-2">Score Details (All inputs are optional)</span>
                <InputText text="Player" onChange={setPlayer}/>
                <div className="flex items-center space-x-2">
                    <span className="w-32">Date Min:</span>
                    <input type="date" className="text-black w-64 lg:w-56  rounded-sm border-gray-400 border-2 px-2" onChange={(e) => setDateMin(e.target.valueAsNumber)}/>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-32">Date Max:</span>
                    <input type="date" className="text-black w-64 lg:w-56  rounded-sm border-gray-400 border-2 px-2" onChange={(e) => setDateMax(e.target.valueAsNumber)}/>
                </div>
                <MinMax text="Acc" update={setAcc} />
                <MinMax text="Combo" update={setCombo} />
                <MinMax text="Miss" update={setMisses} />
                <MinMax text="pp" update={setPp} />
                
                <div className="flex items-center space-x-2">
                    <span className="w-32">Include:</span>
                    <ModSelect update={setModsInclude}/>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-32">Exclude:</span>
                    <ModSelect update={setModsExclude}/>
                </div>
            </div>
            <div className="px-8 pb-8 pt-4 lg:pt-0 lg:mt-8 flex w-full items-center lg:space-x-4 space-y-4 lg:space-y-0 flex-col lg:flex-row">
                <button disabled={isCacheLoading} className={`${isCacheLoading ? 'bg-blue-400 cursor-default' : 'bg-blue-700 hover:bg-blue-900'}   text-white px-4 py-2 rounded-sm shadow-sm`} onClick={() => printQuery()}>
                    {isCacheLoading ? 'Cache Loading... (<5mins)' : 'Search'}
                </button>
                {!isPageLoading && 
                    <div className="flex lg:space-x-4 items-center text-white flex-col lg:flex-row space-y-2 lg:space-y-0">
                        <span className="text-center">
                            {numberResults} Results
                        </span>
                        <button onClick={() => exportToDb()} className="hidden lg:block bg-blue-700 hover:bg-blue-900 text-white px-4 py-2 rounded-sm shadow-sm">
                            {!exportLoading ? 
                                <span>Export to Collection Helper .db file</span> :
                                <CircularProgress size={15} className={classes.loading}/>
                            }
                        </button>
                        <SortingDropdown setPageNumber={setPageNumber} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder}/>
                    </div>
                }
            </div>

            {numberResults !== 0 && (
                <div className="flex flex-col m-4 lg:m-8 p-4 rounded-md bg-white text-black space-y-4 items-center lg:items-start">
                    <Pagination isLoading={isPageLoading} number={numberResults} pageNumber={pageNumber} setPageNumber={setPageNumber} pageSize={pageSize} setPageSize={setPageSize} />
                    <ScoreTable scores={data} />
                </div>
                
            )}
        </div>
    )
}