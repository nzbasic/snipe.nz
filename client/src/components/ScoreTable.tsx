import { DefaultRecordType } from "rc-table/lib/interface"
import { StyleTwoTone } from "@material-ui/icons"
import NumberFormat from "react-number-format"
import moment from 'moment'
import { Play } from "../../../models/play"
import React from "react"
import Table from 'rc-table'
import { v4 as uuidv4 } from 'uuid'

const renderSong = (value: string, record: Play, index: number) => {
    return renderEllipsis(<a href={"/beatmap/" + record.beatmapId} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{record.artist} - {record.song} [{record.difficulty}]</a>);
}

const renderEllipsis = (value: JSX.Element) => {
    const style: any = { whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }

    return (
        <div key={uuidv4()} style={{ display: 'grid', placeItems: 'stretch' }}>
            <div style={style}>
                {value}
            </div>
        </div>
    )
}

export const ScoreTable = ({ scores, snipe, player }: { scores: Play[], snipe?: boolean, player?: boolean }) => {

    let columns = [
        { 
            title: 'Beatmap',
            dataIndex: 'artist',
            width: snipe ? 2500 : 2000,
            ellipsis: true, 
            render: renderSong
        },
        {
            title: 'Age',
            dataIndex: 'date',
            width: snipe ? 500 : 150,
            ellipsis: true,
            render: (value: string, record: Play) => renderEllipsis(<span>{moment(record.date).fromNow(true)}</span>)
        },
    ]

    if (!snipe) {
        columns.push({ 
            title: 'pp',
            dataIndex: 'pp',
            width: 200,
            ellipsis: true, 
            render: (value: string, record: Play) => renderEllipsis(<span>{record.pp.toFixed(0)}</span>)
        },
        {
            title: 'Acc',
            dataIndex: 'acc',
            width: 150,
            ellipsis: true, 
            render: (value: string, record: Play) => renderEllipsis(<span>{(record.acc*100).toFixed(2)}%</span>)
        },
        { 
            title: 'Mods',
            dataIndex: 'mods',
            width: 200,
            ellipsis: true, 
            render: (value: string, record: Play) => renderEllipsis(<span>{record.mods.join("")}</span>)
        },
        { 
            title: 'Score',
            dataIndex: 'score',
            width: 300,
            ellipsis: true,
            render: (value: string, record: Play) => renderEllipsis(<NumberFormat className="" value={record?.score} displayType={'text'} thousandSeparator={true}/>)
        })

        if (!player) {
            columns.push({
                title: 'Player',
                dataIndex: 'player',
                width: 400,
                ellipsis: true,
                render: (value: string, record: Play) => renderEllipsis(<a className="text-blue-400 hover:underline" href={"/redirect/" + record.player}>{value}</a>)
            })
        }
    } 

    

    return (
        <Table columns={columns} data={scores} />
    )
}

