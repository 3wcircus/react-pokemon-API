import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"
import ListPokemon from "./components/list-pokemon.jsx"
import ViewPokemon from "./components/view-pokemon.jsx"

function NavBar() {
    const location = useLocation();
    const isDetail = location.pathname.startsWith('/pokemon/');
    return (
        <nav className="navbar navbar-dark bg-dark px-4">
            <Link to="/" className="navbar-brand fw-bold fs-5">Pokédex</Link>
            {isDetail && (
                <Link to="/" className="btn btn-outline-light btn-sm ms-auto">← Back to Pokédex</Link>
            )}
        </nav>
    );
}

export default function App() {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<ListPokemon />} />
                <Route path="/pokemon/:id" element={<ViewPokemon />} />
            </Routes>
        </Router>
    );
}
