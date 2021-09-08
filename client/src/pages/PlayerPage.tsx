import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom'
import { Play } from '../../../models/play'
import axios from 'axios'
import { Player } from '../../../models/Player.model';
import ScrollAnimation from 'react-animate-on-scroll';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles, Typography } from '@material-ui/core';
import { Snipe } from '../../../models/Snipe.model';
import { TimeSeriesChart } from '../components/TimeSeriesChart'
import CircularProgress from '@material-ui/core/CircularProgress'
import { PlayerActivity } from '../components/PlayerActivity'
import { PlayerSniping } from '../components/PlayerSniping'
import { PlayerScores } from '../components/PlayerScores'

const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    loading: {
      color: "white"
    }
}));

interface GraphData {
    time: number,
    total: number
}
interface Loading {
    any: string
}

const loadingData: Loading[] = []

for (let i = 0; i < 500; i++) {
    loadingData.push({ any: "-"})
}

export const PlayerPage = (props: RouteComponentProps<{ id: string }>) => {
    const [isPlayerLoading, setPlayerLoading] = useState(true)
    const [numberThisWeek, setNumberThisWeek] = useState(0)
    const [player, setPlayer] = useState<Player>({ id: 0, name: "", firstCount: 0})
    const [rawSnipeData, setRawSnipeData] = useState<GraphData[]>([])
    const id = props.match.params.id
    const classes = useStyles();

    useEffect(() => {
        axios.get("/api/players/" + id).then(res => {
            setPlayer(res.data)
            window.document.title = res.data.name
        })

        axios.get("/api/activity/" + id).then(res => {
            const sortedSnipes: Snipe[] = res.data.sort((a: Snipe, b: Snipe) => a.time - b.time)
            const firstPoint: GraphData = { time: sortedSnipes[0]?.time??(new Date().getTime()) - 86400, total: 0 }
            const rawData: GraphData[] = [firstPoint]
            let lastTotal = 0
            sortedSnipes.forEach(data => {
                const newPoint = {} as GraphData
                newPoint.time = data.time
                if (data.victim === parseInt(id)) {
                    newPoint.total = lastTotal - 1
                } else {
                    newPoint.total = lastTotal + 1
                }
    
                lastTotal = newPoint.total
                rawData.push(newPoint)
            })
    
            let count = 0;
            sortedSnipes.filter(item => item.time > new Date().getTime() - (604800 * 1000)).forEach(data => {
                if (data.victim === parseInt(id)) {
                    count--;
                } else {
                    count++;
                }
            })
                
            setNumberThisWeek(count)
            setRawSnipeData(rawData.sort((a, b) => b.time - a.time))
            setPlayerLoading(false)
        })
    }, [id])

    

    const refreshUser = () => {
        setPlayerLoading(true)
        axios.post("/api/players/refresh/" + id).then(res => {
            setPlayerLoading(false)
        })
    }

    return (
        <div className="flex flex-col w-full text-white">
            <ScrollAnimation animateIn="animate__slideInRight" className="bg-green-400 flex p-8">
                <a href={"https://osu.ppy.sh/users/" + player.id} target="_blank" rel="noreferrer" className="text-4xl md:text-9xl font-semibold animate-underline">{player.name}</a>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-black flex p-8 w-full ">
                <button disabled={isPlayerLoading} onClick={() => refreshUser()} className={`${isPlayerLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-800'}  text-white px-2 py-1 rounded-sm`}>Refresh using last 50 plays (1 minute)</button>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-pink-400 text-xl md:text-4xl space-y-2 flex flex-col p-8 w-full">
                <span>Number #1s: {player.firstCount}</span>
                <div className="flex items-center">
                    <span className="mr-2">Snipes this week:</span>
                    {isPlayerLoading ? 
                        <CircularProgress className={classes.loading}/> :
                        <span>{numberThisWeek >= 0 ? "+" + numberThisWeek : numberThisWeek}</span>
                    }
                </div>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-black flex items-center justify-center p-8 w-full h-96 text-black">
                {!isPlayerLoading ? 
                    <TimeSeriesChart chartData={rawSnipeData} brush={true} title={true}/> : 
                    <CircularProgress className={classes.loading} size="10rem"/>    
                } 
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-blue-400 flex flex-col space-y-4 p-8">
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>People you are sniping</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="flex flex-col">
                        <PlayerSniping id={id} playerAsSniper={true}/>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>People who are sniping you</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="flex flex-col">
                        <PlayerSniping id={id} playerAsSniper={false}/>
                    </AccordionDetails>
                </Accordion>

                <Accordion >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>Activity</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="flex flex-col">
                        <PlayerActivity id={id} />
                    </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded={true}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>Your #1s</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="flex flex-col text-xs lg:text-base">
                        <PlayerScores id={id} name={player.name} />
                    </AccordionDetails>
                </Accordion>
                
            </ScrollAnimation>
        </div>
    )
}

