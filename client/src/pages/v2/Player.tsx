import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Player } from '../../../../models/Player.model';
import ScrollAnimation from 'react-animate-on-scroll';
import { makeStyles } from '@material-ui/core';
import { Snipe } from '../../../../models/Snipe.model';
import { TimeSeriesChart } from '../../components/TimeSeriesChart'
import CircularProgress from '@material-ui/core/CircularProgress'
import { PlayerActivity } from '../../components/PlayerActivity'
import { PlayerSniping } from '../../components/PlayerSniping'
import { PlayerScores } from '../../components/PlayerScores'
import { Helmet } from 'react-helmet';
import { SimpleSummaryAccordion } from '../../components/SimpleSummaryAccordion'
import { useApi } from '../../hooks/useApi';

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

const PlayerPage: React.FC = () => {
  const [isPlayerLoading, setPlayerLoading] = useState(true)
  const [numberThisWeek, setNumberThisWeek] = useState(0)
  const [rawSnipeData, setRawSnipeData] = useState<GraphData[]>([])

  const classes = useStyles();
  const { id } = useParams()

  const { data: player, loading: playerLoading } = useApi<Player>("/api/players/" + id)
  const { data: activity, loading: activityLoading } = useApi<Snipe[]>("/api/activity/" + id)

  useEffect(() => {
    if (!id || !activity) return

    const sortedSnipes: Snipe[] = activity.sort((a: Snipe, b: Snipe) => a.time - b.time)
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
  }, [id, activity, player])


  const refreshUser = () => {
    setPlayerLoading(true)
    axios.post("/api/players/refresh/" + id).then(res => {
      setPlayerLoading(false)
    })
  }

  return (
    <div className="flex flex-col w-full text-white">
      <Helmet>
        <meta property="og:title" content={player?.name + "'s snipe profile"} />
        <meta property="og:description" content={`See ${player?.name}'s country #1s, snipe history, activity, who they are sniping, and who is sniping them.`} />
        <meta property="og:image" content={"https://a.ppy.sh/" + player?.id} />
        <meta name="twitter:image" content={"https://a.ppy.sh/" + player?.id} />
        <meta name="twitter:title" content={player?.name + "'s snipe profile"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content={`See ${player?.name}'s country #1s, snipe history, activity, who they are sniping, and who is sniping them.`} />
      </Helmet>
      <div className="bg-function flex rounded-t-md p-4 md:p-8">
        <a href={"https://osu.ppy.sh/users/" + player?.id} target="_blank" rel="noreferrer" className="text-4xl md:text-9xl font-semibold animate-underline">{player?.name}</a>
      </div>
      <div className="flex p-4 md:p-8 w-full ">
        <button disabled={isPlayerLoading} onClick={() => refreshUser()} className={`${isPlayerLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-800'}  text-white px-2 py-1 rounded-sm`}>Refresh using last 50 plays (1 minute)</button>
      </div>
      <div className="bg-function text-xl md:text-4xl space-y-2 flex flex-col p-4 md:p-8 w-full">
        <span>Number #1s: {player?.firstCount}</span>
        <div className="flex items-center">
          <span className="mr-2">Snipes this week:</span>
          {isPlayerLoading ? 
            <CircularProgress className={classes.loading}/> :
            <span>{numberThisWeek >= 0 ? "+" + numberThisWeek : numberThisWeek}</span>
          }
        </div>
      </div>
      <div className="flex items-center justify-center p-4 md:p-8 w-full h-96 text-black">
        {!isPlayerLoading ? 
          <TimeSeriesChart chartData={rawSnipeData} brush={true} title={true}/> : 
          <CircularProgress className={classes.loading} size="10rem"/>    
        } 
      </div>

      {id && (
        <div className="flex flex-col space-y-4 p-4 md:p-8">
          <SimpleSummaryAccordion title="People you are sniping" >
            <PlayerSniping id={id} playerAsSniper={true}/>
          </SimpleSummaryAccordion>

          <SimpleSummaryAccordion title="People who are sniping you" >
            <PlayerSniping id={id} playerAsSniper={false}/>
          </SimpleSummaryAccordion>

          <SimpleSummaryAccordion title="Activity" >
            <PlayerActivity id={id} />
          </SimpleSummaryAccordion>

          <SimpleSummaryAccordion title="Your #1s" >
            <PlayerScores id={id} name={player?.name??""} />
          </SimpleSummaryAccordion>
        </div>
      )}
    </div>
  )
}

export default PlayerPage;
