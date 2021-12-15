import axios from "axios"
import { CircularProgress } from "@material-ui/core"
import { useEffect, useState } from "react"
import { Player } from "../../../models/Player.model"
import Countdown from 'react-countdown';
import { Link } from "react-router-dom";
import { PlayerScores } from "../components/PlayerScores";
import { SimpleSummaryAccordion } from "../components/SimpleSummaryAccordion";
import { TargetSnipes } from '../components/TargetSnipes';
import { SnipeTotal } from "../../../models/Snipe.model";

export interface Target {
    player: Player
    dateBegin: number
    dateEnd: number
}

interface TargetRes {
    target: Target
    snipes: SnipeTotal[]
}

export const DailyTarget = () => {
    const [target, setTarget] = useState<Target>()
    const [snipes, setSnipes] = useState<SnipeTotal[]>([])
    const month = new Date().getMonth() + 1

    useEffect(() => {
        document.title = "Daily Target"
        axios.get<TargetRes>("/api/target").then(res => {
            setTarget(res.data.target)
            setSnipes(res.data.snipes)
        })
    }, [])

    return (
        <div className="text-white flex flex-col items-center gap-2 px-4">
            {target ? (
                <div className="flex flex-col gap-1 items-center mt-8 max-w-7xl w-full">
                    <Link to={"/player/" + target.player.id} className="hover:underline text-5xl">{target.player.name}</Link>
                    <div className="flex gap-1 text-2xl">
                        <span>Time remaining:</span>
                        <Countdown onComplete={() => window.location.reload()} daysInHours={true} date={target.dateEnd} />
                    </div>
                    {(target.player.name === "ningalu" && month === 11) && <span className="text-2xl">Happy no ningalu November!</span>}
                    <div className="mt-4 w-full">
                        <SimpleSummaryAccordion expanded title="Times Sniped Today" >
                            <TargetSnipes id={target.player.id} target={target} data={snipes} />
                        </SimpleSummaryAccordion>
                    </div>
                    <div className="mt-4 w-full mb-8">
                        <SimpleSummaryAccordion expanded title="#1s" >
                            <PlayerScores id={target.player.id.toString()} name={target.player.name} />
                        </SimpleSummaryAccordion>
                    </div>
                </div>
            ) : <CircularProgress />}
        </div>
    )
}