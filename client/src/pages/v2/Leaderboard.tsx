import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { SearchParams, SearchResponse, SnipeCountResponse } from '../../types/api';

enum Mode {
  NUMBER_ONES = "Number of #1s",
  SNIPER = "Snipes",
  VICTIM = "Times sniped"
}

interface PlayerStat {
  name: string,
  count: number,
  id: number
}

const modes = [Mode.NUMBER_ONES, Mode.SNIPER, Mode.VICTIM]
const snipeUrl = "/api/activity/topSniped"
const allUrl = "/api/players"

const baseParams: SearchParams = { pageSize: 100, pageNumber: 1, order: -1 }

const Home: React.FC = () => {
  const [url, setUrl] = useState(allUrl)
  const [params, setParams] = useState(baseParams)
  const [mode, setMode] = useState(Mode.NUMBER_ONES)
  const [tableEntries, setTableEntries] = useState<PlayerStat[]>([])
  
  const { data, loading } = useApi<SearchResponse | SnipeCountResponse>(url, { params })

  useEffect(() => {
    let entries: PlayerStat[] = []
    if (data) {
      if ('page' in data) {
        entries = data.page.map(stat => {
          return { 
            name: stat.player.name,
            count: stat.count,
            id: stat.player.id
          }
        })
      } else {
        entries = data.players.map(stat => {
          return { 
            name: stat.name,
            count: stat.firstCount,
            id: stat.id
          }
        })
      }
    
      setTableEntries(entries)
    }
  }, [data])

  useEffect(() => {
    if (mode === Mode.VICTIM || mode === Mode.SNIPER) {
      setParams(prev => { return {...prev, isSniper: mode === Mode.SNIPER } })
      setUrl(snipeUrl)
    } else {
      setParams(prev => { return {...prev } })
      setUrl(allUrl)
    }
  }, [mode])

  return (
    <div className="w-full h-full flex flex-col p-8">
      <Helmet>
        <meta property="og:title" content="NZ country #1 leaderboard" />
        <meta property="og:description" content="See who has the most #1s, most snipes, and who is sniped the most." />
        <meta property="og:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
        <meta name="twitter:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
        <meta name="twitter:title" content="NZ country #1 leaderboard" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content="See who has the most #1s, most snipes, and who is sniped the most." />
      </Helmet>
      <div className="grid grid-cols-3 rounded border border-function">
        {modes.map(item => (
          <button 
            key={item} 
            className={classNames(
              { 'bg-function': mode === item },
              { 'hover:bg-function': mode !== item },
              "w-full transition-colors py-2" 
            )}
            onClick={() => setMode(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tableEntries.length === 0 ? 
        <div className="mt-4 w-full flex justify-center">Loading...</div> :
        <table className="mt-4 leaderboard">
          <thead>
            <tr>
              <th className="w-6 text-left">#</th>
              <th>Name</th>
              <th>Number</th>
            </tr>
          </thead>
          
          <tbody>
            {tableEntries.map((item, index) => (
              <tr key={item.id} className="cursor-pointer" onClick={() => { window.location.href="/player/" + item.id }}>
                <td>{index+1}</td>
                <td>{item.name}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
          
  )
};

export default Home;
