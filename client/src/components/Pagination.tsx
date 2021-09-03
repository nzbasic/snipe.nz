import React, { useEffect, useState } from 'react';

interface PaginationProps {
    text: string,
    number: number,
    pageNumber: number,
    setPageNumber: React.Dispatch<React.SetStateAction<number>>,
    pageSize: number,
    setPageSize: React.Dispatch<React.SetStateAction<number>>
}

export const Pagination = ({text, number, pageNumber, setPageNumber, pageSize, setPageSize}: PaginationProps) => {
    return (
        <div className="flex space-x-4 items-center mt-4">
            <span>{number} {text}</span>
            <button onClick={() => setPageNumber(pageNumber-1)} disabled={pageNumber === 1} className={`${pageNumber === 1 ? 'bg-blue-400 cursor-default': 'bg-blue-600'} px-2 py-1 rounded-sm text-white`}>Prev</button>
            <span className="w-4 text-center">{pageNumber}</span>
            <button onClick={() => setPageNumber(pageNumber+1)} disabled={pageNumber*pageSize > number} className={`${pageNumber*pageSize > number ? 'bg-blue-400 cursor-default': 'bg-blue-600'} px-2 py-1 rounded-sm text-white`}>Next</button>
            <select onChange={(e) => setPageSize(parseInt(e.target.value))} value={pageSize} className="border-2 border-black">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
            </select>
        </div>
    )
}