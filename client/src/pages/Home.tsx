import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios'
import { Player } from '../../../models/Player.model';
import { AiFillCrown } from 'react-icons/ai'
import ScrollAnimation from 'react-animate-on-scroll';
import { Beatmap } from '../../../models/Beatmap.model';
import { Play } from '../../../models/play';

const randomNamePool = [
    "YEP",
    "cd36",
    "Prendar",
    "ningalu",
    "DTJump",
    "HRJump",
    "BobStevenson",
    "jaminclaw",
    "bluetayden",
    "yumi",
    "catcat",
    "dogdog",
    "bestyLMAO",
    "Ayachi Nene",
    "Zoomer"
]

const randomMapPool = [
    "Freedom Dive",
    "Plasma Gun",
    "Scarlet Rose",
    "Chika Chika",
    "Daidai Genome",
    "Gay Bar",
    "Blue Zenith",
    "Padoru",
    "Kimi no Bouken",
    "Santa San",
    "Sunglow",
    "Sidetracked Kids",
]

const initialTop: Player[] = [
    { name: "jiantz", firstCount: 2441, id: 1 },
    { name: "downy", firstCount: 2427, id: 2 },
    { name: "Kiiwa", firstCount: 1583, id: 3 },
    { name: "Flauz", firstCount: 1120, id: 4 },
    { name: "Big Z", firstCount: 1117, id: 5 }
]

const getRandomSnipe = (): string => {
    const map = Math.floor(Math.random() * randomMapPool.length)
    const firstPlayer = Math.floor(Math.random() * randomNamePool.length)
    let secondPlayer = firstPlayer;
    do { 
        secondPlayer = Math.floor(Math.random() * randomNamePool.length)
    } while(firstPlayer === secondPlayer)

    return randomNamePool[firstPlayer] + " has sniped " + randomNamePool[secondPlayer] + " on " + randomMapPool[map]
}

export const Home = () => {
    const [top5, setTop5] = useState<Player[]>(initialTop)
    const [carousel, setCarousel] = useState<string[]>([])
    const [randomBeatmap, setRandomBeatmap] = useState<Play>()

    useEffect(() => {
        axios.get("/api/players", { params: { pageSize: 5, pageNumber: 1, order: -1 }}).then((res => {
            setTop5(res.data.players)
        }))

        const randomCarousel: string[] = []
        for (let i = 0; i < 6; i++) {
            randomCarousel.push(getRandomSnipe())
        }
        setCarousel(randomCarousel)

        getRandomBeatmap()
    }, [])

    useEffect(() => {
        setTimeout(() => {
            const clone: string[] = JSON.parse(JSON.stringify(carousel))
            clone.pop()
            clone.unshift(getRandomSnipe())
            setCarousel(clone)
        }, 5000)
    }, [carousel])

    const getRandomBeatmap = () => {
        axios.get("/api/beatmaps/random").then((res => {
            setRandomBeatmap(res.data)
        }))
    }

    return (
        <div className="flex flex-col text-white">
            <div className="bg-blue-500 flex items-center py-12 font-extrabold flex-col">
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white text-center">Welcome to Snipe.nz</h1>
                <h3 className="mt-2 text-xl md:text-2xl lg:text-4xl xl:text-5xl text-white text-center">Find and Snipe Country #1s in osu!</h3>
            </div>
            <ScrollAnimation animateIn="animate__slideInRight" className="bg-black flex py-12 px-8 2xl:px-44 w-full lg:flex-nowrap flex-wrap justify-around sm:justify-between items-center">
                <div className="flex flex-col">
                    <h2 className="text-5xl lg:text-7xl text-white">Climb to the top.</h2>
                    <h4 className="text-2xl lg:text-3xl text-white max-w-3xl">See who currently holds the most country number #1s on the leaderboard.</h4>
                </div>
                <div className="w-full md:w-auto flex justify-center">
                    <div className="mt-8 sm:mt-0 mr-8 sm:mr-0 inline-flex flex-col p-4 text-2xl lg:text-3xl lg:space-y-2 md:space-y-1 space-y-0">
                        {top5.map((user, index) => (
                            <div className="flex items-center space-x-4" key={user.id}>
                                <span className="w-6">{index === 0 ? <AiFillCrown style={{color: "yellow"}}/> : null}</span>
                                <span>#{index+1}</span>
                                <a className="animate-underline z-0 w-24" href={"/player/" + user.id}>{user.name}:</a>
                                <span className="w-16">{user.firstCount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInLeft" className="bg-green-500 flex lg:flex-nowrap flex-wrap-reverse py-12 w-full px-8 2xl:px-44 justify-center sm:justify-between items-center">
                <span className="mt-8 sm:mt-0 h-80 lg:max-w-3xl w-full border-2 border-white flex items-center justify-center">Some graph</span>
                <span className="mb-8 ml-8 text-5xl lg:text-5xl pr-4">Follow your stats over time.</span>
            </ScrollAnimation>
            <ScrollAnimation animateIn="animate__slideInRight" className="bg-black flex px-8 2xl:px-44 p-8 flex-wrap lg:flex-nowrap justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-5xl lg:text-5xl">View the latest activity.</span>
                    <span className="text-2xl lg:text-xl max-w-sm">New snipes will show up in the live feed on the activity page.</span>
                </div>
                <div className="flex flex-col p-4 w-full text-xs md:text-sm lg:text-2xl space-y-1 h-44 lg:h-64 text-center lg:text-right mt-8 lg:mt-0">
                    {carousel.map((item, index) => (
                        <span key={index}>{item}</span>
                    ))}
                </div>
            </ScrollAnimation> 
            <ScrollAnimation animateIn="animate__slideInLeft" duration={0.5} className="bg-indigo-600 flex flex-wrap-reverse lg:flex-no-wrap justify-between p-8 px-8 2xl:px-44 items-center">
                <div className="flex flex-col lg:max-w-xl 2xl:max-w-3xl w-full justify-center items-center mt-8 lg:mt-0">
                    <button className="px-2 py-1 text-lg bg-gray-200 rounded-sm text-black hover:bg-gray-300 transition duration-200" onClick={() => getRandomBeatmap()}>Get Random #1</button>
                    <a href={"https://osu.ppy.sh/beatmaps/" + (randomBeatmap?.beatmapId??"2790767")} target="_blank" rel="noreferrer" className="mt-2 animate-underline truncate text-center">{randomBeatmap?.song??"Press the button to get a random map!"}</a>
                    <span>Played by: {randomBeatmap?.player}</span>
                    <span>Score: {randomBeatmap?.score}</span>
                </div>
                <div className="flex flex-col pr-4">
                    <span className="text-3xl lg:text-3xl lg:text-right">Get Recommendations</span>
                    <span className="text-2xl lg:text-lg lg:text-right">Random maps will be given to you to try snipe.</span>
                </div>
            </ScrollAnimation>
            <div className="h-32 items-center px-8 2xl:px-44 bg-black flex py-4 text-5xl justify-end">
                <a className="animate-underline pr-4" target="_blank" rel="noreferrer" href="https://github.com/nzbasic">Site by nzbasic</a>
            </div>
        </div>
    )
}