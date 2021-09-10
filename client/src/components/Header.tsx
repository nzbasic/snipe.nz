import React, { useState } from 'react'
import Hamburger from 'hamburger-react'

const HeaderButton = ({text, link}: { text: string, link: string}) => (
    <a className="animate-underline text-5xl xl:text-2xl" href={link}>{text}</a>
)

const HiddenMenu = ({visible}: { visible: boolean }) => (
    <div className={`${visible ? 'pb-16' : 'h-menu-off'} xl:hidden bg-black w-full flex flex-col justify-center items-center space-y-10 z-10`}>
        <HeaderButton text="Leaderboard" link="/players"/>
        <HeaderButton text="Query" link="/query"/>
        <HeaderButton text="Scores" link="/scores"/>
        <HeaderButton text="Activity" link="/activity"/>
        <HeaderButton text="Stats" link="/stats"/>
    </div>
)

export const Header = () => {
    const [burger, setBurger] = useState(false)

    return (
        <div className="flex flex-col max-h-full">
            <div className="h-36 bg-black text-white flex items-center px-12 lg:px-20 justify-between">
                <a href="/" className="text-5xl font-extrabold">Snipe.nz</a>
                <div className="hidden xl:flex space-x-8">
                    <HeaderButton text="Leaderboard" link="/players"/>
                    <HeaderButton text="Query" link="/query"/>
                    <HeaderButton text="Scores" link="/scores"/>
                    <HeaderButton text="Activity" link="/activity"/>
                    <HeaderButton text="Stats" link="/stats"/>
                </div>
                <div className="xl:hidden">
                    <Hamburger toggled={burger} toggle={setBurger}/>
                </div>
            </div>
            <HiddenMenu visible={burger}/>
        </div>
        
    )
}