import axios from 'axios';
import React, { useEffect, useState } from 'react';

export const Stats = () => {

    useEffect(() => {
        axios.get("/api/activity/topSniped", { params: { isSniper: true, pageNumber: 1, pageSize: 10 }}).then(res => {
            console.log(res.data)
        })
    }, [])

    return (
        <div>

        </div>
    )
}