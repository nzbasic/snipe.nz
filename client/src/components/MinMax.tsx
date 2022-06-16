import { useEffect, useState } from 'react';
import NumericInput from 'react-numeric-input';
import { MinMaxData } from '../../../models/query'

const numericStyle = { input: { color: "black", width: "5rem"  } }

export const MinMax = ({ text, update }: { text: string, update: React.Dispatch<React.SetStateAction<MinMaxData>> }) => {
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(0);
    const [changedMin, setChangedMin] = useState(false);
    const [changedMax, setChangedMax] = useState(false);

    useEffect(() => {
        update({ min, max, changedMin, changedMax });
    }, [min, max, update, changedMin, changedMax])
    
    return (
        <div className="flex space-x-2 items-center">
            <span className="w-32">{text} Min:</span>
            <NumericInput onChange={(value) => { setMin(value??0); setChangedMin(true) }} style={numericStyle} color="" step={0.1} />
            <span className="pr-1">Max:</span>
            <NumericInput onChange={(value) => { setMax(value??0); setChangedMax(true) }} style={numericStyle} step={0.1} />
        </div>
    )
}