import axios from 'axios'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export const Redirect = () => {
    const { name } = useParams()

    useEffect(() => {
        axios.get("/api/players/nameToId/" + name).then(res => {
            window.location.replace("/player/" + res.data);
        })
    }, [name])

    return (<div></div>)
}