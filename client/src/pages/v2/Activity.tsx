import React, { useEffect } from 'react';
import { FormattedSnipe } from '../../../../models/Snipe.model'
import { SingleActivity } from '../../components/SingleActivity'
import { Helmet } from 'react-helmet';
import { useApi } from '../../hooks/useApi';

const numberShown = 50;
const Activity: React.FC = () => {
  const { data, loading } = useApi<FormattedSnipe[]>("/api/activity/latest/" + numberShown)

  return (
    <div className="flex flex-col w-full">
      <Helmet>
        <meta property="og:title" content="Latest snipe activity" />
        <meta property="og:description" content="See the latest NZ country #1 snipes." />
        <meta property="og:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
        <meta name="twitter:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
        <meta name="twitter:title" content="Latest Snipe Activity" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content="See the latest NZ country #1 snipes." />
      </Helmet>
      <div className="flex flex-col text-white text-xs md:text-xl lg:text-2xl xl:text-3xl space-y-1 p-8">
        <span className="text-3xl md:text-6xl">Latest {numberShown} Snipes:</span>
        {!loading ? (
          data?.map((item, index) => (
            <SingleActivity key={index} snipe={item}/>
          ))
        ) : <span>Loading Activity...</span>}
      </div>
    </div>
  )
}

export default Activity;
