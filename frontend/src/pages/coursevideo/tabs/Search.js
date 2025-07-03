import React from 'react'
import { BsSearch } from "react-icons/bs";
import './Search.css'
const Search = () => {
    return (
        <div className="search-container">
            <div className="search-box">
                <input className="form-control shadow-none" type="text" placeholder="Search course content" aria-label="Search" />
                <button className="btn search-btn" type="submit">
                    <BsSearch className='search-icon' />
                </button>
            </div>

            <div className="search-text">
                <h2>Start a new search</h2>
                <span>To find captions, lectures, or resources</span>
            </div>
        </div>
    )
}

export default Search
