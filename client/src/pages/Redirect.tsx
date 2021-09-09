import axios from 'axios'
import React, { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'

export const Redirect = (props: RouteComponentProps<{ name: string }>) => {
    const name = props.match.params.name

    useEffect(() => {
        axios.get("/api/players/nameToId/" + name).then(res => {
            window.location.replace("/player/" + res.data);
        })
    }, [name])

    return (<div></div>)
}