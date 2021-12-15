import React, { useEffect, useState } from "react"
import { SnipeTotal } from "../../../models/Snipe.model";
import axios from "axios";
import { Pagination } from "./Pagination";
import { PlayerSnipeAccordion } from './PlayerSnipeAccordion';
import { Target } from "../pages/DailyTarget";

export const TargetSnipes = ({ id, target, data }: { id: number, target: Target, data: SnipeTotal[] }) => {

    return (
        <div className="flex flex-col text-white w-full">
            {data.length === 0 ? 
                <span>No snipes today</span> : 
                data.sort((a,b) => b.total - a.total).map((item, index) => (
                    <PlayerSnipeAccordion key={index} total={item} id={id.toString()} playerAsSniper={false} dateBegin={target.dateBegin} dateEnd={target.dateEnd} />
                ))
            }
        </div>
    )
}