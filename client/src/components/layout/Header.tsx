import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames'

const headers = [
  { title: "Top 100", path: "/leaderboard" },
  { title: "Query", path: "/query" },
  { title: "Scores", path: "/scores" },
  { title: "Daily", path: "/daily" },
  { title: "Activity", path: "/activity" },
  { title: "Stats", path: "/stats" }
]

const Header: React.FC = () => {
  const [active, setActive] = useState("")
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    const match = path.match(/\/\w*/g)
    if (match) {
      const menuItem = headers.find(item => item.path === match[0])
      if (menuItem) {
        setActive(menuItem.title)
      } else {
        setActive("")
      }
    }
  }, [location])

  return (
    <div className="max-h-16 h-16 w-full bg-transparent flex items-center justify-between px-4">
      <Link to="/" className="flex items-center gap-2 hover:text-function transition-colors"> 
        <img 
          width="40"
          height="40"
          src="https://media.discordapp.net/attachments/882111142355435540/986860742642909195/snipe.png" 
          alt="logo" 
        />
        <span className="hidden sm:block">snipe.nz</span>
      </Link>

      <div className="items-center gap-2 text-xs sm:gap-3 sm:text-base md:text-lg md:gap-4 flex">
        {headers.map(header => (
          <Link 
            className={classNames(
              "hover:text-function transition-colors",
              { 'text-function': active === header.title }
            )} 
            to={header.path} 
            key={header.path}
          >
            {header.title}
          </Link>
        ))}
      </div>
    </div>
  )
};

export default Header;
