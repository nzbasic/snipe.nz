import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { SnipeTotal } from "../../../models/Snipe.model";
import axios from "axios";
import { Pagination } from "./Pagination";

export const PlayerSniping = ({ id, playerAsSniper }: { id: string, playerAsSniper: boolean }) => {
    const [isLoading, setLoading] = useState(true)
    const [data, setData] = useState<SnipeTotal[]>([])
    const [pageNumber, setPageNumber] = useState(1)
    const [numberResults, setNumberResults] = useState(0)
    const pageSize = 20

    useEffect(() => {
        setLoading(true)
        axios.get("/api/activity/sniped/" + id, { params: { pageSize, pageNumber, playerAsSniper } }).then(res => {
            setData(res.data.page)
            setNumberResults(res.data.number)
            setLoading(false)
        })
    }, [id, pageSize, pageNumber, playerAsSniper])

    return (
        <div className="flex flex-col">
            {!isLoading ? 
                data.length === 0 ? 
                    <span>You haven't sniped anyone</span> : 
                    data.map((item, index) => (
                        <span key={index}>{item.name} - {item.total}</span> 
                    ))
            : Array.from(Array(pageSize).keys()).map((_, index) => (
                <span key={index}>Loading...</span>
            )) }
            <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageSize={pageSize} number={numberResults} />
        </div>
    )
}