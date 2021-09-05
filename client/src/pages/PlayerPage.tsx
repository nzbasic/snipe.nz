import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom'
import { Play } from '../../../models/play'
import axios from 'axios'
import { Player } from '../../../models/Player.model';
import NumberFormat from 'react-number-format'
import { Pagination } from '../components/Pagination'
import ScrollAnimation from 'react-animate-on-scroll';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles, Typography } from '@material-ui/core';
import { FormattedSnipe, Snipe, SnipeTotal } from '../../../models/Snipe.model';
import { TimeSeriesChart } from '../components/TimeSeriesChart'
import CircularProgress from '@material-ui/core/CircularProgress'

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
    const [plays, setPlays] = useState<Play[]>([])
    const [numberThisWeek, setNumberThisWeek] = useState(0)
    const [numberPlays, setNumberPlays] = useState(0)
    const [pageNumber, setPageNumber] = useState(1)
    const [player, setPlayer] = useState<Player>({ id: 0, name: "", firstCount: 0})
    const [isScoresLoading, setScoresLoading] = useState(true)
    const [pageSize, setPageSize] = useState(20)
    const [activity, setActivity] = useState<FormattedSnipe[]>([])
    const [isActivityLoading, setActivityLoading] = useState(true)
    const [rawSnipeData, setRawSnipeData] = useState<GraphData[]>([])
    const [snipedByData, setSnipedByData] = useState<SnipeTotal[]>([])
    const [snipedData, setSnipedData] = useState<SnipeTotal[]>([])
    const [isSnipedByLoading, setSnipedByLoading] = useState(true)
    const [isSnipedLoading, setSnipedLoading] = useState(true)
    const id = props.match.params.id
    const classes = useStyles();

    useEffect(() => {
        axios.get("/api/players/" + id).then(res => {
            setPlayer(res.data)
            window.document.title = res.data.name
        })

        axios.get("/api/activity/" + id).then(res => {
            if (plays.length === 0) return
            const sortedSnipes: Snipe[] = res.data.sort((a: Snipe, b: Snipe) => b.time - a.time)
            const firstPoint: GraphData = { time: new Date().getTime(), total: numberPlays }
            const rawData: GraphData[] = [firstPoint]
            let lastTotal = numberPlays
            sortedSnipes.forEach(data => {
                const newPoint = {} as GraphData
                newPoint.time = data.time
                if (data.victim === parseInt(id)) {
                    newPoint.total = lastTotal + 1
                } else {
                    newPoint.total = lastTotal - 1
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
    }, [id, numberPlays, plays])

    useEffect(() => {
        setScoresLoading(true)
        axios.get("/api/scores", { params: { id, pageNumber, pageSize } }).then(res => {
            setNumberPlays(res.data.numberPlays)
            setPlays(res.data.plays)
            setScoresLoading(false)
        })
    }, [pageNumber, pageSize, id])

    const refreshUser = () => {
        setScoresLoading(true)
        axios.post("/api/players/refresh/" + id).then(res => {
            setScoresLoading(false)
            setPageNumber(1)
        })
    }

    const refreshMap = (id: number) => {
        setScoresLoading(true)
        axios.post("/api/beatmaps/refresh/" + id).then(res => {
            setScoresLoading(false)
            setPageNumber(1)
        })
    }

    const loadSniped = () => {
        if (isSnipedLoading) {
            axios.get("/api/activity/sniped/" + id).then(res => {
                setSnipedData(res.data.sort((a: SnipeTotal, b: SnipeTotal) => b.total - a.total))
                setSnipedLoading(false)
            })
        }
    }

    const loadVictim = () => {
        if (isSnipedByLoading) {
            axios.get("/api/activity/snipedBy/" + id).then(res => {
                setSnipedByData(res.data.sort((a: SnipeTotal, b: SnipeTotal) => b.total - a.total))
                setSnipedByLoading(false)
            })
        }
    }

    const loadActivity = () => {
        if (isActivityLoading) {
            axios.get("/api/activity/latestWeek/" + id).then(res => {
                setActivity(res.data.sort((a: FormattedSnipe, b: FormattedSnipe) => b.time - a.time))
                setActivityLoading(false)
            })
        }
    }

    return (
        <div className="flex flex-col w-full text-white">
            <ScrollAnimation animateIn="animate__slideInRight" className="bg-green-400 flex p-8">
                <a href={"https://osu.ppy.sh/users/" + player.id} target="_blank" rel="noreferrer" className="text-4xl md:text-9xl font-semibold animate-underline">{player.name}</a>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-black flex p-8 w-full ">
                <button disabled={isScoresLoading} onClick={() => refreshUser()} className={`${isScoresLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-800'}  text-white px-2 py-1 rounded-sm`}>Refresh using last 50 plays (1 minute)</button>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-pink-400 text-xl md:text-4xl space-y-2 flex flex-col p-8 w-full">
                <span>Number #1s: {player.firstCount}</span>
                <div className="flex items-center">
                    <span className="mr-2">Change this week:</span>
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
                <Accordion onChange={() => loadSniped()}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>People you are sniping</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="flex flex-col">
                        {!isSnipedLoading ? 
                            snipedData.length === 0 ? 
                                <span>You haven't sniped anyone.</span> :
                                snipedData.map((item, index) => (
                                    <span key={index}>{item.name} - {item.total}</span>
                                ))
                            : <span>Loading...</span>
                        }
                    </AccordionDetails>
                </Accordion>

                <Accordion onChange={() => loadVictim()}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>People who are sniping you</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="flex flex-col">
                        {!isSnipedByLoading ? 
                            snipedByData.length === 0 ? 
                                <span>You haven't been sniped.</span> :
                                snipedByData.map((item, index) => (
                                    <span key={index}>{item.name} - {item.total}</span>
                                ))
                            : <span>Loading...</span>
                        }
                    </AccordionDetails>
                </Accordion>

                <Accordion onChange={() => loadActivity()}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>Activity this week</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="flex flex-col">
                        {!isActivityLoading ? 
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
                            : <span>Loading...</span>
                        }
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
                        {!isScoresLoading ? plays.map((play, index) => (
                            <div key={play.id} className="flex space-x-2">
                                <span className="w-8">{(index+1) + ((pageNumber-1) * pageSize)}</span>
                                <span className="w-16 lg:w-28 truncate">{play.artist}</span>
                                <a href={"https://osu.ppy.sh/beatmaps/" + play.beatmapId} target="_blank" rel="noreferrer" className="truncate w-32 lg:w-60 text-blue-300 hover:underline">{play.song}</a>
                                <span className="w-20 lg:w-40 truncate">[{play.difficulty}]</span>
                                <NumberFormat className="w-24 hidden md:block" value={play.score} displayType={'text'} thousandSeparator={true}/>
                                <span className="hidden md:block w-12 lg:w-16">{(play.pp??0).toFixed(0)}pp</span>
                                <span className="w-16 hidden lg:block">{(play.acc*100).toFixed(2)}%</span>
                                <span className="w-20 hidden lg:block truncate">{play.mods.join("")}</span>
                                <a href={"https://osu.ppy.sh/scores/osu/" + play.id} target="_blank" rel="noreferrer" className="w-8 truncate text-blue-300 hover:underline">Link</a>
                                <button onClick={() => refreshMap(play.beatmapId)} className="hidden md:block text-blue-300 w-24 hover:underline">Refresh</button>
                            </div>
                        )) : loadingData.slice(0, pageSize).map((item, index) => (
                            <div key={index} className="flex space-x-2">
                                <span className="w-8">{(index+1) + ((pageNumber-1) * pageSize)}</span>
                                <span>Loading...</span>
                            </div>
                        ))
                        }
                        <Pagination text="Plays" number={numberPlays} pageSize={pageSize} setPageSize={setPageSize} pageNumber={pageNumber} setPageNumber={setPageNumber}/> 
                    </AccordionDetails>
                </Accordion>
                
            </ScrollAnimation>
        </div>
    )
}

