import React, { useState, useEffect } from "react";
import "./App.css";
import * as BooksAPI from "./BooksAPI";

function App() {
    const [showSearchPage, setShowSearchPage] = useState(false);
    const [books, setBooks] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        BooksAPI.getAll().then((res) => setBooks(res));
    }, []);

    const updateBookShelf = async (book, newShelf) => {
        await BooksAPI.update(book, newShelf);

        // Update main page books
        setBooks((prevBooks) => {
            const bookExists = prevBooks.find((b) => b.id === book.id);
            if (newShelf === "none") {
                return prevBooks.filter((b) => b.id !== book.id);
            }
            if (bookExists) {
                return prevBooks.map((b) =>
                    b.id === book.id ? { ...b, shelf: newShelf } : b
                );
            }
            return [...prevBooks, { ...book, shelf: newShelf }];
        });

        // Update search results
        setSearchResults((prevResults) =>
            prevResults.map((b) =>
                b.id === book.id ? { ...b, shelf: newShelf } : b
            )
        );
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim()) {
            try {
                const results = await BooksAPI.search(query, 20);
                if (results.error) {
                    setSearchResults([]);
                } else {
                    setSearchResults(
                        results.map((book) => ({
                            ...book,
                            shelf:
                                books.find((b) => b.id === book.id)?.shelf ||
                                "none",
                        }))
                    );
                }
            } catch {
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    const renderBook = (book) => (
        <li key={book.id}>
            <div className="book">
                <div className="book-top">
                    <div
                        className="book-cover"
                        style={{
                            width: 128,
                            height: 193,
                            backgroundImage: `url(${
                                book.imageLinks?.thumbnail || ""
                            })`,
                        }}
                    />
                    <div className="book-shelf-changer">
                        <select
                            value={book.shelf}
                            onChange={(e) =>
                                updateBookShelf(book, e.target.value)
                            }
                        >
                            <option value="move" disabled>
                                Move to...
                            </option>
                            <option value="currentlyReading">
                                Currently Reading
                            </option>
                            <option value="wantToRead">Want to Read</option>
                            <option value="read">Read</option>
                            <option value="none">None</option>
                        </select>
                    </div>
                </div>
                <div className="book-title">{book.title}</div>
                <div className="book-authors">
                    {book.authors?.join(", ") || "Unknown Author"}
                </div>
            </div>
        </li>
    );

    const renderShelf = (title, shelfId) => (
        <div className="bookshelf">
            <h2 className="bookshelf-title">{title}</h2>
            <div className="bookshelf-books">
                <ol className="books-grid">
                    {books
                        .filter((book) => book.shelf === shelfId)
                        .map(renderBook)}
                </ol>
            </div>
        </div>
    );

    return (
        <div className="app">
            {showSearchPage ? (
                <div className="search-books">
                    <div className="search-books-bar">
                        <button
                            className="close-search"
                            onClick={() => setShowSearchPage(false)}
                        >
                            Close
                        </button>
                        <div className="search-books-input-wrapper">
                            <input
                                type="text"
                                placeholder="Search by title, author, or ISBN"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="search-books-results">
                        <ol className="books-grid">
                            {searchResults.map(renderBook)}
                        </ol>
                    </div>
                </div>
            ) : (
                <div className="list-books">
                    <div className="list-books-title">
                        <h1>MyReads</h1>
                    </div>
                    <div className="list-books-content">
                        <div>
                            {renderShelf(
                                "Currently Reading",
                                "currentlyReading"
                            )}
                            {renderShelf("Want to Read", "wantToRead")}
                            {renderShelf("Read", "read")}
                        </div>
                    </div>
                    <div className="open-search">
                        <button onClick={() => setShowSearchPage(true)}>
                            Add a book
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
