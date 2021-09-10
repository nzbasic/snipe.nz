import { DefaultRecordType } from "rc-table/lib/interface"
import { StyleTwoTone } from "@material-ui/icons"
import NumberFormat from "react-number-format"
import moment from 'moment'
import { Play } from "../../../models/play"
import React from "react"
import Table from 'rc-table'

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
        width: '30%',
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
        width: '6%',
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
        render: (value: string, record: Play) => renderEllipsis(<span>{record.mods.join("")}</span>)
    },
    {
        title: 'Age',
        dataIndex: 'date',
        width: '8%',
        ellipsis: true,
        render: (value: string, record: Play) => renderEllipsis(<span>{moment(record.date).fromNow(true)}</span>)
    }
]

export const ScoreTable = ({ scores }: { scores: Play[] }) => {

    return (
        <Table columns={columns} data={scores} />
    )
}

