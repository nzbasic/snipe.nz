export const InputText = ({ text, onChange }: { text: string, onChange: React.Dispatch<React.SetStateAction<string>> }) => {
    return (
        <div className="flex space-x-2">
            <span className="w-32">{text}</span>
            <input className="text-black rounded-sm border-gray-400 border-2 px-2 w-64 lg:w-56 " placeholder={"Search " + text} type="text" onChange={(e) => onChange(e.target.value)} />
        </div>
    )
}