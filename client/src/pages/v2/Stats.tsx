import { CircularProgress } from '@material-ui/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { StatsResponse } from '../../types/api';

const Stats: React.FC = () => {
  const { data, loading } = useApi<StatsResponse>("/api/scores/stats")

  return !loading ? (
    <div className="flex flex-col bg-grey space-y-1 p-8 items-center text-white">
      <Helmet>
        <meta property="og:title" content="Stats about NZ country #1s" />
        <meta property="og:description" content="See statistics about the most contested beatmaps and the most snipes/sniped person this week." />
        <meta property="og:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
        <meta name="twitter:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
        <meta name="twitter:title" content="Stats about NZ country #1s" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content="See statistics about the most contested beatmaps and the most snipes/sniped person this week." />
      </Helmet>
      <span className="text-xl lg:text-4xl p-4">Most Contested Beatmaps</span>
      {data?.contested.map(item => (
        <div className="flex bg-dark max-w-xl w-full rounded p-2 space-x-2 justify-between">
          <Link to={"/beatmap/" + item.beatmap.id} className="text-function hover:underline truncate">{item.beatmap.song}</Link>
          <span>{item.count}</span>
        </div>
      ))}
      <span className="text-xl lg:text-4xl p-4">Weekly Snipers</span>
      {data?.topSniperWeek.map(item => (
        <div className="flex bg-dark max-w-xl w-full rounded p-2 space-x-2 justify-between">
          <Link to={"/player/" + item.player.id} className="text-function hover:underline">{item.player.name}</Link>
          <span>{item.count}</span>
        </div>
      ))}
      <span className="text-xl lg:text-4xl p-4">Weekly Victims</span>
      {data?.topVictimWeek.map(item => (
        <div className="flex bg-dark max-w-xl w-full rounded p-2 space-x-2 justify-between">
          <Link to={"/player/" + item.player.id} className="text-function hover:underline">{item.player.name}</Link>
          <span>{item.count}</span>
        </div>
      ))}
    </div>
  ) : <div className="w-full h-screen flex flex-col items-center justify-center">
      <CircularProgress />
    </div>
}

export default Stats;
