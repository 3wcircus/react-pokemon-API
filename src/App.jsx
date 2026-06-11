/**
 * App.jsx — Root component
 *
 * Responsible for:
 *   1. Wrapping the entire app in a client-side Router
 *   2. Rendering the persistent NavBar on every page
 *   3. Declaring the two application routes:
 *        /               → ListPokemon  (browsable Pokédex grid)
 *        /pokemon/:id    → ViewPokemon  (individual Pokémon detail)
 */
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"
import ListPokemon from "./components/list-pokemon.jsx"
import ViewPokemon from "./components/view-pokemon.jsx"

/**
 * NavBar — Context-aware top navigation bar.
 *
 * Uses useLocation() to read the current URL and conditionally renders
 * a "Back to Pokédex" button on the right side when the user is viewing
 * a Pokémon detail page (/pokemon/:id).
 *
 * NavBar must be rendered *inside* <Router> (not alongside it) so that
 * the useLocation hook has access to the router context.
 */
function NavBar() {
    const location = useLocation();

    // Detect whether the user is on a detail page so we can show the back button
    const isDetail = location.pathname.startsWith('/pokemon/');

    return (
        <nav className="navbar navbar-dark bg-dark px-4">
            {/* Brand link always navigates back to the Pokédex list */}
            <Link to="/" className="navbar-brand fw-bold fs-5">Pokédex</Link>

            {/* Back button is only shown on /pokemon/:id — ms-auto pushes it to the right */}
            {isDetail && (
                <Link to="/" className="btn btn-outline-light btn-sm ms-auto">← Back to Pokédex</Link>
            )}
        </nav>
    );
}

/**
 * App — Top-level component that bootstraps routing.
 *
 * BrowserRouter (aliased as Router) uses the HTML5 History API for clean
 * URLs without hash fragments. NavBar sits outside <Routes> so it renders
 * on every page regardless of which route is active.
 */
export default function App() {
    return (
        <Router>
            {/* NavBar is outside <Routes> so it persists across all pages */}
            <NavBar />

            <Routes>
                {/* List page: shows the full searchable, paginated Pokédex */}
                <Route path="/" element={<ListPokemon />} />

                {/* Detail page: :id is the National Pokédex number (e.g. /pokemon/25) */}
                <Route path="/pokemon/:id" element={<ViewPokemon />} />
            </Routes>
        </Router>
    );
}
