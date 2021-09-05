import { FormattedSnipe } from "../../../models/Snipe.model";

export const SingleActivity = ({snipe}: { snipe: FormattedSnipe }) => {
    return (
        <div className="flex flex-row text-xs lg:text-base lg:max-w-7xl max-w-xs sm:max-w-md items-center space-x-1">
            <span className="hidden md:block truncate">{new Date(snipe.time).toLocaleString()}:</span>
            <a href={"/player/" + snipe.sniperId} className="hover:underline truncate text-green-400">{snipe.sniper}</a>
            <span>sniped</span>
            <a href={"/player/" + snipe.victimId} className="hover:underline truncate text-red-400">{snipe.victim}</a>
            <span>on</span>
            <a href={"https://osu.ppy.sh/beatmaps/" + snipe.beatmapId} target="_blank" rel="noreferrer" className="hover:underline truncate text-blue-400">{snipe.beatmap}</a>
        </div>
    )
}