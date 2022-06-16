import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { SearchParams, SearchResponse } from '../../types/api';
import { useDebounce } from "use-debounce/lib";
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import SearchIcon from "@material-ui/icons/Search";
import { CircularProgress } from '@material-ui/core';

interface PropTypes {
  className?: string
}

const baseParams: SearchParams = { pageSize: 5, pageNumber: 1, order: -1 }

const Search: React.FC<PropTypes> = ({ className }) => {
  const [params, setParams] = useState(baseParams)
  const [search, setSearch] = useState("");
  const [debouncedSearchTerm] = useDebounce(search, 250)
  const { data, loading } = useApi<SearchResponse>("/api/players", { params })

  useEffect(() => {
    setParams(prev => { return {...prev, searchTerm: debouncedSearchTerm } })
  }, [debouncedSearchTerm])

  return (
    <div className={classNames(className, "w-60 h-72 flex flex-col gap-2")}>
      {loading ? 
        <div className="w-full h-full flex items-center justify-center"><CircularProgress /></div> :
        <>
          <div className="flex items-center -ml-5 z-0">
            <SearchIcon
              className="relative left-8 z-10 text-blue-400 dark:text-blue-500"
              fontSize="small"
            />
            <input 
              className="text-white bg-dark p-1 pl-9 rounded"
              type="text"
              value={search}
              placeholder="Search..."
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col border-function border-2 rounded bg-dark w-full">
            {data?.players.map(player => (
              <Link 
                to={"/player/" + player.id} 
                key={player.id} 
                className="m-1 p-2 hover:bg-function rounded justify-between flex items-center transition-colors"
              >
                <span>{player.name}</span>
                <span>{player.firstCount}</span>  
              </Link>
            ))}
          </div>
        </>
      }
    </div>
  )
};

export default Search;
