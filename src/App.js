import { useEffect, useState } from "react"

import axios from 'axios'
import Movie from "./components/Movie"
import Youtube from 'react-youtube'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import { Navbar, Container, Nav, NavDropdown, Form, FormControl, Button, Dropdown } from 'react-bootstrap';


function App() {
    const MOVIE_API = "https://api.themoviedb.org/3/"
    const SEARCH_API = MOVIE_API + "search/movie"
    const DISCOVER_API = MOVIE_API + "discover/movie"
    const API_KEY = "YOUR API KEY"
    const BACKDROP_PATH = "https://image.tmdb.org/t/p/w1280"

    const [playing, setPlaying] = useState(false)
    const [trailer, setTrailer] = useState(null)
    const [movies, setMovies] = useState([])
    const [searchKey, setSearchKey] = useState("")
    const [movie, setMovie] = useState({ title: "Loading Movies" })
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchMovies()
    }, [])

    const handleSort = (order) => {
        setSortOrder(order);
    };


    const fetchMovies = async (event, genre) => {
        if (event) {
            event.preventDefault()
        }
        if (genre) {
            setSearchKey("")
        }

        const { data } = await axios.get(`${searchKey ? SEARCH_API : DISCOVER_API}`, {
            params: {
                api_key: API_KEY,
                query: searchKey,
                with_genres: genre
            }
        })

        console.log(data.results[0])
        setMovies(data.results)
        setMovie(data.results[0])

        if (data.results.length) {
            await fetchMovie(data.results[0].id)
        }
    }
    const fetchMovie = async (id) => {
        const { data } = await axios.get(`${MOVIE_API}movie/${id}`, {
            params: {
                api_key: API_KEY,
                append_to_response: "videos"
            }
        })

        if (data.videos && data.videos.results) {
            const trailer = data.videos.results.find(vid => vid.name === "pv")
            setTrailer(trailer ? trailer : data.videos.results[0])
        }

        setMovie(data)
    }
    const selectMovie = (movie) => {
        fetchMovie(movie.id)
        setPlaying(false)
        setMovie(movie)
        window.scrollTo(0, 0)
    }

    const renderMovies = () => {

        const sortedMovies = movies.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });


        return sortedMovies.map((movie) => (
            <Movie
                selectMovie={selectMovie}
                key={movie.id}
                movie={movie}
            />
        ));
    };



    return (
        <div className="App">
            <Navbar bg="transparent" variant="dark" className="center-max-size header">
                <Container fluid>
                    <Navbar.Brand href="/" className="brand">Movie App</Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="me-auto my-2 my-lg-0"
                            style={{ maxHeight: '100px' }}
                            navbarScroll
                        >
                            <Nav.Link href="/">Trending</Nav.Link>

                            <NavDropdown title="Genres" id="navbarScrollingDropdown">
                                <NavDropdown.Item onClick={(event) => { fetchMovies(event, 28); }}>Action</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={(event) => { fetchMovies(event, 35); }}>
                                    Comedy
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={(event) => { fetchMovies(event, 10749); }}>
                                    Romance
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={(event) => { fetchMovies(event, 16); }}>
                                    Animation
                                </NavDropdown.Item>

                            </NavDropdown>
                        </Nav>
                        <Form className="d-flex" onSubmit={fetchMovies}>
                            <Form.Control
                                type="search"
                                id="search"
                                className="me-2"
                                onInput={(event) => setSearchKey(event.target.value)}
                            />
                            <Button variant="outline-light" type="submit">Search</Button>
                        </Form>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {
                movies.length ?
                    <main>
                        {movie ?
                            <div className="poster"
                                style={{ backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)), url(${BACKDROP_PATH}${movie.backdrop_path})` }}>
                                {playing ?
                                    <>
                                        <Youtube
                                            videoId={trailer.key}
                                            className={"youtube amru"}
                                            containerClassName={"youtube-container amru"}
                                            opts={
                                                {
                                                    width: '100%',
                                                    height: '100%',
                                                    playerVars: {
                                                        autoplay: 1,
                                                        controls: 0,
                                                        cc_load_policy: 0,
                                                        fs: 0,
                                                        iv_load_policy: 0,
                                                        modestbranding: 0,
                                                        rel: 0,
                                                        showinfo: 0,
                                                    },
                                                }
                                            }
                                        />
                                        <button onClick={() => setPlaying(false)} className={"button close-video"}>Close
                                        </button>
                                    </> :
                                    <div className="center-max-size">
                                        <div className="poster-content">
                                            {trailer ?
                                                <button className={"button play-video"} onClick={() => setPlaying(true)}
                                                    type="button">Play
                                                    Trailer</button>
                                                : 'Sorry, no trailer available'}
                                            <h1>{movie.title}</h1>
                                            <p>{movie.overview}</p>
                                        </div>
                                    </div>
                                }
                            </div>
                            : null}
                        <div className="center-max-size mt-2 mb-2">
                            <Dropdown>
                                <Dropdown.Toggle id="dropdown-button-dark-example1" variant="secondary">
                                    Order By
                                </Dropdown.Toggle>

                                <Dropdown.Menu variant="dark">

                                    <Dropdown.Item onClick={() => handleSort("asc")}>A-Z (Ascending)</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={() => handleSort("dsc")}>Z-A (Descending)</Dropdown.Item>

                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <div className={"center-max-size container"}>
                            {renderMovies()}
                        </div>
                    </main>
                    : 'Sorry, no movies found'
            }
        </div >
    );
}

export default App;
