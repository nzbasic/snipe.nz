import React from 'react'

interface SortingDropdownProps {
    setPageNumber: React.Dispatch<React.SetStateAction<number>>,
    setSortBy: React.Dispatch<React.SetStateAction<string>>,
    setSortOrder: React.Dispatch<React.SetStateAction<string>>,
    sortBy: string,
    sortOrder: string
}

const options = [
    { value: "score", label: "Score"},
    { value: "date", label: "Date"},
    { value: "acc", label: "Accuracy"},
    { value: "pp", label: "pp"}
]

export const SortingDropdown = ({ setPageNumber, setSortBy, setSortOrder, sortBy, sortOrder }: SortingDropdownProps) => {

    return (
        <div className="flex items-center mb-4 space-x-2">
            <span>Sort by:</span>
            <select onChange={(e) => {setPageNumber(1); setSortBy(e.target.value)}} value={sortBy} className="text-black border border-black">
                {options.map(item => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                ))}
            </select>
            <span>Order:</span>
            <select onChange={(e) => {setPageNumber(1); setSortOrder(e.target.value)}} value={sortOrder} className="text-black border border-black">
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
            </select>
        </div>
    )
}