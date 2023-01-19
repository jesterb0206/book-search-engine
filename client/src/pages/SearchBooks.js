import React, { useState, useEffect } from 'react';
import {
  Jumbotron,
  Container,
  Col,
  Form,
  Button,
  Card,
  CardColumns,
} from 'react-bootstrap';
import Auth from '../utils/auth';
import { searchGoogleBooks } from '../utils/API';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations';
import { GET_ME } from '../utils/queries';

const SearchBooks = () => {
  // Create State for Holding Returned Google API Data

  const [searchedBooks, setSearchedBooks] = useState([]);

  // Create State for Holding Our Search Field Data

  const [searchInput, setSearchInput] = useState('');

  // Create State to Hold Saved bookId Values

  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [saveBook, { error }] = useMutation(SAVE_BOOK, {
    // The Block Below Ensures That as Soon as a User Saves a Book, It Appears Right Away in Their Saved Books Page

    update(cache, { data: { saveBook } }) {
      try {
        const { me } = cache.readQuery({
          query: GET_ME,
        });

        cache.writeQuery({
          query: GET_ME,
          data: {
            me: {
              ...me,
              savedBooks: [
                ...me.savedBooks,
                saveBook.savedBooks[saveBook.savedBooks.length - 1],
              ],
            },
          },
        });
      } catch (e) {}
    },
  });

  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

  // A Create Method to Search for Books and Set the State on Form Submit

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        link: book.volumeInfo.previewLink,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // A Create Function to Handle Saving a Book to Our Database

  const handleSaveBook = async (bookId) => {
    // Find the Book in The `searchBooks` State by Its Matching ID

    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    // Get Authorization Tokens

    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) {
      return false;
    }

    try {
      await saveBook({
        variables: { bookToSave },
      });

      // If a Book Successfully Saves to the User’s Account, Save the Corresponding Book’s ID to State

      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
      saveBookIds(savedBookIds);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Jumbotron fluid className="text-light bg-dark">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <CardColumns>
          {searchedBooks.map((book) => {
            return (
              <Card key={book.bookId} border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )}
                      className="btn-block btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )
                        ? 'This book has already been saved!'
                        : 'Save this book!'}
                    </Button>
                  )}
                  <a
                    target="_blank"
                    rel="noreferrer noopener"
                    id="link"
                    href={book.link}
                  >
                    {book.link == null
                      ? 'No Link Available'
                      : 'Link to Google Books'}
                  </a>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SearchBooks;
