import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as BooksAPI from "./BooksAPI";
import BookGrid from "./BookGrid";

function SearchPage({ books, onUpdateBookShelf }) {
    const [searchResults, setSearchResults] = useState([]);
    const [query, setQuery] = useState("");

    const handleSearch = async (event) => {
        const value = event.target.value;
        setQuery(value);

        if (value.trim()) {
            try {
                const results = await BooksAPI.search(value, 20);

                // Map existing shelf status from library books
                const mappedResults = results.map((result) => {
                    const libraryBook = books.find((b) => b.id === result.id);
                    return libraryBook ? libraryBook : result;
                });

                setSearchResults(results || []);
            } catch (error) {
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    return (
        <div className="search-books">
            <div className="search-books-bar">
                <Link to="/" className="close-search">
                    Close
                </Link>
                <div className="search-books-input-wrapper">
                    <input
                        type="text"
                        placeholder="Search by title, author, or ISBN"
                        value={query}
                        onChange={handleSearch}
                    />
                </div>
            </div>
            <div className="search-books-results">
                <BookGrid
                    books={searchResults}
                    onUpdateBookShelf={onUpdateBookShelf}
                />
            </div>
        </div>
    );
}

export default SearchPage;
