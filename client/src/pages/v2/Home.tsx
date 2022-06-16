import React from 'react';
import { Link } from 'react-router-dom';
import InfoBox from '../../components/home/InfoBox';
import Search from '../../components/navigation/Search'
import { useApi } from '../../hooks/useApi';
import { Snipe, StatsResponse } from '../../types/api';
import { FaChartLine, FaDiscord, FaSearch } from 'react-icons/fa'
import { BiTargetLock } from 'react-icons/bi'
import { CircularProgress } from '@material-ui/core';
import { Helmet } from 'react-helmet';

const inviteLink = process.env.INVITE_LINK??"discord.gg/osunz"

const Home: React.FC = () => {
  const { data: activity, loading: activityLoading } = useApi<Snipe[]>("/api/activity/latest/" + 12)
  const { data: stats, loading: statsLoading } = useApi<StatsResponse>("/api/scores/stats")

  return (
    <div className="w-full h-full flex flex-col">
      <Helmet>
        <meta property="og:title" content="snipe.nz Home Page" />
        <meta property="og:description" content="snipe.nz is a website you can use to view NZ osu! country #1's, who has the most number #1s, the latest snipes, and more." />
        <meta property="og:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
        <meta name="twitter:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
        <meta name="twitter:title" content="snipe.nz Home Page" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content="snipe.nz is a website you can use to view NZ osu! country #1's, who has the most number #1s, the latest snipes, and more." />
      </Helmet>
      <div className="p-8 flex justify-between">
        <div className="flex flex-col">
          <h1 className="font-extrabold text-4xl">Welcome to snipe.nz!</h1>
          <h3 className="font-semibold text-2xl">Find and Snipe Country #1s in osu!</h3>
          <Search className="mt-4" />
        </div>
        <div className="hidden lg:flex flex-col max-h-96 overflow-y-hidden max-w-lg xl:max-w-2xl min-w-0 w-full xl:text-xl text-right">
          <h1 className="font-semibold text-4xl">Latest Snipes</h1>
          {activityLoading ? 
            <div className="w-full h-full flex items-center justify-center"><CircularProgress /></div> : 
            activity?.map((item, index) => (
              <span className="truncate" key={index}>
                <Link to={"/player/" + item.sniperId} className="text-declaration">{item.sniper} </Link>
                has sniped
                <Link to={"/player/" + item.victimId} className="text-keyword"> {item.victim} </Link>
                on
                <Link to={"/beatmap/" + item.beatmapId} className="text-variable"> {item.beatmap}</Link>
              </span>
            ))
          }
        </div>
      </div>

      <div className="w-full flex flex-col px-8 py-4 text-2xl font-medium bg-function">
        <span>{stats?.snipeCount??0} Snipes</span>
        <span>{stats?.beatmapCount??0} Beatmaps Tracked</span>
        <span>{stats?.scoreCount??0} Scores</span>
      </div>

      <div className="flex flex-col w-full p-8 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoBox icon={<FaDiscord size="50" />} text="Full discord bot integration on the osu!nz discord server" />
          <InfoBox icon={<FaChartLine size="50" />} text="Snipe history is tracked and graphed over time" />
          <InfoBox icon={<FaSearch size="50" />} text="A powerful query engine for advanced searches" />
          <InfoBox icon={<BiTargetLock size="50" />} text="Daily snipe targets are chosen at random" />
        </div>
      </div>

      <div className="w-full flex flex-col px-8 py-4 text-2xl font-medium bg-function">
        <span>Join the discord! <a rel="noreferrer" target="_blank" href={"https://" + inviteLink}>{inviteLink}</a></span>
      </div>

      <div className="px-4 md:px-8 flex flex-col items-start py-4">
        <div className="flex flex-col mt-2">
          <span className="text-lg font-medium">Check out Batch Beatmap Downloader!</span>
          <span className="mt-2">Features:</span>
          <span>- Mass download osu! beatmaps</span>
          <span>- Has all (most) ranked, loved, and tournament maps</span>
          <span>- Filter for the maps you want using a powerful query generator</span>
          <span>- Add downloaded maps to a new collection</span>
          <a
              href="https://github.com/nzbasic/batch-beatmap-downloader"
              target="_blank"
              rel="noreferrer"
              className="text-function mt-4"
          >
              Click here to check it out!
          </a>
        </div>
      </div>

    </div>
  )
};

export default Home;
