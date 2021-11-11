import React, { useEffect, useState } from "react"
import { SnipeTotal } from "../../../models/Snipe.model";
import axios from "axios";
import { Pagination } from "./Pagination";
import { PlayerSnipeAccordion } from './PlayerSnipeAccordion';

export const TargetSnipes = ({ id, dateEnd, data }: { id: number, dateEnd: number, data: SnipeTotal[] }) => {

    return (
        <div className="flex flex-col text-white w-full">
            {data.length === 0 ? 
                <span>No snipes today</span> : 
                data.map((item, index) => (
                    <PlayerSnipeAccordion key={index} total={item} id={id.toString()} playerAsSniper={false} dateEnd={dateEnd} />
                ))
            }
        </div>
    )
}