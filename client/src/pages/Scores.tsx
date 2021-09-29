import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import ScrollAnimation from "react-animate-on-scroll"
import { Play } from "../../../models/play"
import { Pagination } from "../components/Pagination"
import { SortingDropdown } from "../components/SortingDropdown"
import { ScoreTable } from '../components/ScoreTable'

export const Scores = () => {
    const [scores, setScores] = useState<Play[]>([])
    const [pageNumber, setPageNumber] = useState(1)
    const [isLoading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(50)
    const [sortBy, setSortBy] = useState("pp")
    const [sortOrder, setSortOrder] = useState("desc")
    const [numberResults, setNumberResults] = useState(0)

    useEffect(() => {
        setLoading(true)
        axios.get("/api/scores/", { params: { pageSize, pageNumber, sortBy, sortOrder }}).then(res => {
            setScores(res.data.plays)
            setLoading(false)
            setNumberResults(res.data.numberPlays)
        })

    }, [pageNumber, pageSize, sortBy, sortOrder])

    return (
        <div className="flex flex-col">
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-green-400 flex flex-col items-center w-full p-8 text-white text-sm md:text-3xl">
                <SortingDropdown setPageNumber={setPageNumber} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder}/>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInRight" className="bg-black flex flex-col items-center justify-center w-full p-8 text-black">
                <div className="flex flex-col bg-gray-100 p-4 rounded-sm items-center text-xs md:text-base">
                    <ScoreTable scores={scores} snipe={false} />
                    <Pagination isLoading={isLoading} number={numberResults} pageSize={pageSize} setPageSize={setPageSize} pageNumber={pageNumber} setPageNumber={setPageNumber} />
                </div>
            </ScrollAnimation>
        </div>
    )
} 