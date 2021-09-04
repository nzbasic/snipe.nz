import React, { useEffect, useState } from 'react';
import axios from 'axios'

export const Activity = () => {

    const numberShown = 15;
    
    useEffect(() => {
        axios.get("/api/activity/latest/" + numberShown).then(res => {
            console.log(res.data)
        })
    }, [])

    return (
        <div>
            d
        </div>
    )
}