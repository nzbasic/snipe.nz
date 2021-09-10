import { useEffect, useMemo, useRef, useState } from "react";

const Mod = ({text, update}: {text: string, update: (mod: string, on: boolean) => void}) => (
    <div className="flex space-x-1">
        <span>{text}</span>
        <input type="checkbox" onChange={(e) => update(text, e.target.checked)} />
    </div>
)

const allMods = ["HR", "HD", "DT", "FL", "NC", "EZ", "NF", "SO", "SD", "PF"]

export const ModSelect = ({ update }: { update: React.Dispatch<React.SetStateAction<string[]>>}) => {
    const [mods, setMods] = useState<Set<string>>(new Set<string>())

    useEffect(() => { 
        update(Array.from(mods));
    }, [mods, update])

    const handleChange = (mod: string, on: boolean) => {
        const clone: Set<string> = new Set(JSON.parse(JSON.stringify(Array.from(mods))))

        if (on) {
            clone.add(mod)
        } else {
            clone.delete(mod)
        }

        setMods(clone)
    }

    return (
        <div className="flex lg:space-x-2 flex-wrap">
            {allMods.map(mod => (
                <Mod key={mod} text={mod} update={handleChange} />
            ))}
        </div>
    )
}