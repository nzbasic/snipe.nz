import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@material-ui/core"
import axios from "axios"
import React, { useState, useEffect } from "react"
import { FormattedSnipe } from "../../../models/Snipe.model"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useStyles } from '../Share'
import { Pagination } from "./Pagination";
import { CopyrightOutlined } from "@material-ui/icons";

interface Option {
    value: string,
    label: string
}

const options: Option[] = [
    { value: "7", label: "Last Week"},
    { value: "31", label: "Last Month"},
    { value: "365", label: "Last Year"},
    { value: "99999", label: "All Time"}
]

export const PlayerActivity = ({ id }: { id: string }) => {
    const [activity, setActivity] = useState<FormattedSnipe[]>([])
    const [pageNumber, setPageNumber] = useState(1)
    const [numberResults, setNumberResults] = useState(0)
    const [option, setOption] = useState(options[0].value)
    const [isLoading, setLoading] = useState(true)
    const classes = useStyles();
    const pageSize = 20

    useEffect(() => {
        setLoading(true)
        axios.get("/api/activity/latestId/" + id, { params: { pageNumber, pageSize, option }}).then(res => {
            setActivity(res.data.page)
            setNumberResults(res.data.number)
            console.log(res.data.number)
            setLoading(false)
        })
    }, [pageNumber, id, pageSize, option])

    return (
        <Accordion >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography className={classes.heading}>Activity</Typography>
            </AccordionSummary>
            <AccordionDetails className="flex flex-col">
                <select onChange={(e) => {setPageNumber(1); setOption(e.target.value)}} value={option} className="text-black border mb-4 w-32 border-black">
                    {options.map(item => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                </select>

                {!isLoading ? 
                    activity.length === 0 ? 
                        <span>You haven't sniped/been sniped this week.</span> :
                        activity.map((item, index) => (
                            <div key={index} className="flex space-x-1">
                                <span className="hidden md:block truncate">{new Date(item.time).toLocaleDateString()}</span>
                                <span className="truncate">sniped {item.victimId === parseInt(id) && 'by'}</span>
                                <a className="hover:underline" href={"/player/" + (item.victimId === parseInt(id) ? item.sniperId : item.victimId)}>{item.victimId === parseInt(id) ? item.sniper : item.victim}</a>
                                <span>on</span>
                                <a href={"https://osu.ppy.sh/beatmaps/" + item.beatmapId} target="_blank" rel="noreferrer" className="hover:underline truncate">{item.beatmap}</a>
                            </div>
                        ))
                    : Array.from(Array(pageSize).keys()).map(() => (
                        <span>Loading...</span>
                    ))
                }   

                <Pagination number={numberResults} pageNumber={pageNumber} setPageNumber={setPageNumber} pageSize={pageSize} />    
            </AccordionDetails>
        </Accordion>
    )
}