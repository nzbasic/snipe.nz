import { Link } from "react-router-dom";
import { FormattedSnipe } from "../../../models/Snipe.model";

export const SingleActivity = ({snipe}: { snipe: FormattedSnipe }) => {
    return (
        <div className="flex flex-row text-xs lg:text-base lg:max-w-7xl max-w-xs sm:max-w-md items-center space-x-1">
            <span className="hidden md:block truncate">{new Date(snipe.time).toLocaleString()}:</span>
            <Link to={"/player/" + snipe.sniperId} className="hover:underline truncate text-green-400">{snipe.sniper}</Link>
            <span>sniped</span>
            <Link to={"/player/" + snipe.victimId} className="hover:underline truncate text-red-400">{snipe.victim}</Link>
            <span>on</span>
            <Link to={"/beatmap/" + snipe.beatmapId} className="hover:underline truncate text-blue-400">{snipe.beatmap}</Link>
        </div>
    )
}