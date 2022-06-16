import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { Play } from "../../../../models/play"
import { Pagination } from "../../components/Pagination"
import { SortingDropdown } from "../../components/SortingDropdown"
import { ScoreTable } from '../../components/ScoreTable'
import { CircularProgress } from "@material-ui/core";
import { Helmet } from "react-helmet"
import { useApi } from "../../hooks/useApi"
import { ScoresResponse } from "../../types/api"

const basePageSize = 50;
const baseParams = { pageSize: 50, pageNumber: 1, sortBy: "pp", sortOrder: "desc" }
const Scores: React.FC = () => {
  const [params, setParams] = useState(baseParams)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(basePageSize)
  const [sortBy, setSortBy] = useState("pp")
  const [sortOrder, setSortOrder] = useState("desc")

  const { data, loading } = useApi<ScoresResponse>("/api/scores", { params })

  useEffect(() => {
    setParams(prev => { return {...prev, pageSize, pageNumber, sortBy, sortOrder }})
  }, [pageNumber, pageSize, sortBy, sortOrder])

  return (
    <div className="flex flex-col gap-4 p-8">
      <Helmet>
        <meta property="og:title" content="NZ country #1 scores list" />
        <meta property="og:description" content="See NZ country #1 scores sorted by pp, date, score and accuracy." />
        <meta property="og:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
        <meta name="twitter:image" content="https://cdn.discordapp.com/attachments/627267590862929961/900962862065938472/snipe.png" />
        <meta name="twitter:title" content="NZ country #1 scores list" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content="See NZ country #1 scores sorted by pp, date, score and accuracy." />
      </Helmet>
      <div className="flex flex-col items-center w-full text-sm md:text-3xl">
        <SortingDropdown setPageNumber={setPageNumber} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder}/>
      </div>
      <div className="flex flex-col items-center justify-center w-full">
        {loading ? <CircularProgress /> : (
          <div className="flex flex-col bg-dark p-4 rounded-sm items-center text-xs md:text-base">
            <ScoreTable scores={data?.plays??[]} />
            <Pagination isLoading={loading} number={data?.numberPlays??0} pageSize={pageSize} setPageSize={setPageSize} pageNumber={pageNumber} setPageNumber={setPageNumber} />
          </div>
        )}
      </div>
    </div>
  )
} 

export default Scores;
