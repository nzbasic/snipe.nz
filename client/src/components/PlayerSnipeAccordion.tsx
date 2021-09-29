import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@material-ui/core";
import { SnipeTotal } from "../../../models/Snipe.model";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useState } from "react";
import { Play } from "../../../models/play";
import axios from 'axios'
import { ScoreTable } from "./ScoreTable";

export const PlayerSnipeAccordion = ({ total, id, playerAsSniper }: { total: SnipeTotal, id: string, playerAsSniper: boolean }) => {
    const [isLoading, setLoading] = useState(true)
    const [scoresLoaded, setScoresLoaded] = useState(false)
    const [plays, setPlays] = useState<Play[]>([])

    const loadSnipes = async (expanded: boolean) => {
        if (expanded && !scoresLoaded) {
            const uri = "/api/activity/snipeData/" + id
            const res = await axios.get(uri, { params: { playerAsSniper: playerAsSniper, enemy: total.name } })
            setPlays(res.data)
            setScoresLoaded(true)
            setLoading(false)
        }
    }

    return (
        <Accordion onChange={(event, expanded) => loadSnipes(expanded)}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <div className="flex items-center">
                    <a href={"/redirect/" + total.name} className="hover:underline">{total.name}</a>
                    <span className="ml-1">- {total.total}</span>
                </div>
            </AccordionSummary>
            <AccordionDetails className="flex flex-col">
                {isLoading ? "Loading..." : (
                    <ScoreTable scores={plays} snipe={true} />
                )}
            </AccordionDetails>
        </Accordion>
    )
}