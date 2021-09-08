import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import ScrollAnimation from "react-animate-on-scroll"
import { Play } from "../../../models/play"
import { Pagination } from "../components/Pagination"
import { SortingDropdown } from "../components/SortingDropdown"
import Table from 'rc-table'
import { DefaultRecordType } from "rc-table/lib/interface"
import { StyleTwoTone } from "@material-ui/icons"
import NumberFormat from "react-number-format"

const renderSong = (value: string, record: Play, index: number) => {
    return renderEllipsis(<a href={"https://osu.ppy.sh/beatmaps/" + record.beatmapId} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{record.artist} - {record.song} [{record.difficulty}]</a>);
}

const renderEllipsis = (value: JSX.Element) => {
    const style: any = { whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }

    return (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
            <div style={style}>
                {value}
            </div>
        </div>
    )
}

const columns = [
    { 
        title: 'Player',
        dataIndex: 'player',
        width: '10%',
        render: (value: string, record: Play) => renderEllipsis(<a className="text-blue-400 hover:underline" href={"/redirect/" + record.player}>{value}</a>)
    },
    { 
        title: 'Beatmap',
        dataIndex: 'artist',
        width: '40%',
        ellipsis: true, 
        render: renderSong
    },
    { 
        title: 'pp',
        dataIndex: 'pp',
        width: '3%',
        ellipsis: true, 
        render: (value: string, record: Play) => renderEllipsis(<span>{record.pp.toFixed(0)}</span>)
    },
    {
        title: 'Acc',
        dataIndex: 'acc',
        width: '5%',
        ellipsis: true, 
        render: (value: string, record: Play) => renderEllipsis(<span>{(record.acc*100).toFixed(2)}%</span>)
    },
    { 
        title: 'Score',
        dataIndex: 'score',
        width: '8%',
        ellipsis: true,
        render: (value: string, record: Play) => renderEllipsis(<NumberFormat className="" value={record?.score} displayType={'text'} thousandSeparator={true}/>)
    },
    { 
        title: 'Mods',
        dataIndex: 'mods',
        width: '6%',
        ellipsis: true, 
        render: (value: string, record: Play) => renderEllipsis(<span>{record.mods.join(",")}</span>)
    }
]

export const Scores = () => {
    const [scores, setScores] = useState<Play[]>([])
    const [pageNumber, setPageNumber] = useState(1)
    const [isLoading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(50)
    const [sortBy, setSortBy] = useState("pp")
    const [sortOrder, setSortOrder] = useState("desc")
    const [numberResults, setNumberResults] = useState(0)

    useEffect(() => {
        setLoading(true)
        axios.get("/api/scores/", { params: { pageSize, pageNumber, sortBy, sortOrder }}).then(res => {
            setScores(res.data.plays)
            setLoading(false)
            setNumberResults(res.data.numberPlays)
        })

    }, [pageNumber, pageSize, sortBy, sortOrder])

    return (
        <div className="flex flex-col">
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-green-400 flex flex-col items-center w-full p-8 pt-12 text-white text-sm md:text-3xl">
                <SortingDropdown setPageNumber={setPageNumber} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder}/>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-black flex flex-col items-center justify-center w-full p-8 text-black">
                <div className="flex flex-col bg-gray-100 p-4 rounded-sm items-center text-xs md:text-base">
                    <Table columns={columns} data={scores} />
                    <Pagination isLoading={isLoading} number={numberResults} pageSize={pageSize} setPageSize={setPageSize} pageNumber={pageNumber} setPageNumber={setPageNumber} />
                </div>
            </ScrollAnimation>
        </div>
    )
} 