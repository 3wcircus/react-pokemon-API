/**
 * list-pokemon.jsx — Pokédex list page
 *
 * Displays a paginated, searchable, sortable grid of all Pokémon.
 *
 * Data strategy: All Pokémon names and PokéAPI URLs are fetched in a single
 * request on mount (limit=2000). This lightweight payload (~50KB of names only)
 * is kept in state and used for all subsequent filtering, sorting, and
 * pagination — no additional API calls are needed as the user interacts.
 *
 * This is preferable to per-page API calls because:
 *   - Search must work across the entire Pokédex, not just the current page
 *   - Sorting must be consistent across all results
 *   - It reduces network round-trips to one
 */
import { useState, useEffect } from 'react';
import '../App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Pokemon from './Pokemon';

/** Number of Pokémon cards displayed per page */
const PAGE_SIZE = 40;

/**
 * PaginationControls — Reusable pagination UI shown at the top and bottom of the grid.
 *
 * Always displays the result count. Prev/Next buttons are only shown when
 * there is more than one page of results, avoiding unnecessary chrome for
 * small search result sets.
 *
 * Defined at module scope (not inside ListPokemon) to avoid React's
 * "component created during render" error, which resets state on each render.
 *
 * Props:
 *   page         {number}   — Current 0-based page index
 *   totalPages   {number}   — Total number of pages for the current filtered result set
 *   count        {number}   — Total number of filtered Pokémon
 *   start        {number}   — 1-based index of the first item on the current page
 *   end          {number}   — 1-based index of the last item on the current page
 *   onPageChange {function} — Callback invoked with the new page index when user navigates
 */
function PaginationControls({ page, totalPages, count, start, end, onPageChange }) {
    return (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            {/* Result count label — hidden while the initial fetch is in flight (count === 0) */}
            <span className="text-muted small">
                {count > 0 ? `Showing ${start}–${end} of ${count} Pokémon` : ''}
            </span>

            {/* Prev/Next only rendered when there are multiple pages */}
            {totalPages > 1 && (
                <div className="d-flex gap-2 align-items-center">
                    <button className="btn btn-outline-secondary btn-sm"
                        disabled={page === 0}
                        onClick={() => onPageChange(page - 1)}>
                        ← Prev
                    </button>
                    {/* Display 1-based page number for human readability */}
                    <span className="text-muted small">Page {page + 1} / {totalPages}</span>
                    <button className="btn btn-outline-secondary btn-sm"
                        disabled={page >= totalPages - 1}
                        onClick={() => onPageChange(page + 1)}>
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Extracts the numeric Pokédex ID from a PokéAPI resource URL.
 *
 * PokéAPI URLs follow the pattern: https://pokeapi.co/api/v2/pokemon/{id}/
 * filter(Boolean) removes the empty string produced by the trailing slash
 * before pop() grabs the last segment.
 *
 * @param {string} url — Full PokéAPI URL (e.g. "https://pokeapi.co/api/v2/pokemon/25/")
 * @returns {number}    — Numeric Pokédex ID (e.g. 25)
 */
const idFromUrl = (url) => parseInt(url.split('/').filter(Boolean).pop(), 10);

/**
 * ListPokemon — Main Pokédex browsing component.
 *
 * State:
 *   allPokemon {Array}  — Full list of {name, url} objects from the PokéAPI (never mutated after fetch)
 *   search     {string} — Current search query (lowercase); filters allPokemon by name substring
 *   sort       {string} — Active sort mode: 'number' (Pokédex order) or 'name' (A–Z)
 *   page       {number} — Current 0-based page index into the filtered+sorted result set
 */
export default function ListPokemon() {
    const [allPokemon, setAllPokemon] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('number');
    const [page, setPage] = useState(0);

    /**
     * Fetch all Pokémon names once on mount.
     * limit=2000 is safely above the current total (~1302) so we get everything in one request.
     * The response only contains names and URLs — no heavy stat/sprite data.
     */
    useEffect(() => {
        fetch('https://pokeapi.co/api/v2/pokemon?limit=2000')
            .then(r => r.json())
            .then(data => setAllPokemon(data.results));
    }, []); // Empty dependency array: runs once on mount only

    /**
     * Derived filtered+sorted list — recomputed whenever allPokemon, search, or sort changes.
     *
     * Filter: case-insensitive substring match on the Pokémon name.
     * Sort: either by numeric ID (natural Pokédex order) or locale-aware alphabetical.
     * A new array is returned each time; allPokemon is never mutated.
     */
    const filtered = allPokemon
        .filter(p => p.name.includes(search.toLowerCase().trim()))
        .sort((a, b) => sort === 'name'
            ? a.name.localeCompare(b.name)
            : idFromUrl(a.url) - idFromUrl(b.url)
        );

    // Pagination calculations derived from the filtered list
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const start = page * PAGE_SIZE + 1;                                       // 1-based start index
    const end = Math.min(page * PAGE_SIZE + PAGE_SIZE, filtered.length);      // 1-based end index (clamped to total)
    const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE); // Items for the current page only

    /**
     * Navigate to a specific page and scroll back to the top of the page.
     * smooth scrolling provides a less jarring experience than an instant jump.
     */
    const goToPage = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Update the search query and reset to page 0.
     * Resetting the page prevents the user from landing on a page that no
     * longer exists if the new search returns fewer results than the current page.
     */
    const handleSearch = (value) => {
        setSearch(value);
        setPage(0);
    };

    /**
     * Change the sort order and reset to page 0.
     * Same reason as handleSearch — page count may change after resorting.
     */
    const handleSort = (value) => {
        setSort(value);
        setPage(0);
    };

    // Bundle pagination props to avoid repeating them for the top and bottom controls
    const paginationProps = { page, totalPages, count: filtered.length, start, end, onPageChange: goToPage };

    return (
        <div className="px-4 py-3">
            {/* ── Search + sort toolbar ─────────────────────────────────────── */}
            <div className="d-flex gap-3 align-items-center mb-3 flex-wrap">
                {/* Search input — flex-grow-1 makes it fill remaining toolbar width */}
                <div className="flex-grow-1">
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Search Pokémon by name…"
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                    />
                </div>

                {/* Sort toggle — active button is filled, inactive is outlined */}
                <div className="btn-group" role="group" aria-label="Sort order">
                    <button type="button"
                        className={`btn btn-sm ${sort === 'number' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => handleSort('number')}>
                        # Number
                    </button>
                    <button type="button"
                        className={`btn btn-sm ${sort === 'name' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => handleSort('name')}>
                        A–Z Name
                    </button>
                </div>
            </div>

            {/* ── Content area — three mutually exclusive states ─────────────── */}

            {allPokemon.length === 0 ? (
                // Loading state: shown while the initial fetch is in flight
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" />
                </div>

            ) : filtered.length === 0 ? (
                // Empty state: shown when the search query matches nothing
                <div className="text-center py-5 text-muted">
                    <p className="fs-5 mb-2">No Pokémon found for &ldquo;{search}&rdquo;</p>
                    <button className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleSearch('')}>
                        Clear search
                    </button>
                </div>

            ) : (
                // Results state: pagination controls, grid, pagination controls
                <>
                    <PaginationControls {...paginationProps} />

                    {/* CSS grid defined in App.css — auto-fills columns at a 200px minimum width */}
                    <div className="grid-container grid-container--fill mt-3">
                        {pageItems.map((pokemon) => {
                            const pokemon_id = idFromUrl(pokemon.url);
                            return (
                                // Sprite images are stored locally in public/img/{id}.png
                                <Pokemon key={pokemon.name} pokemon={pokemon.name}
                                    image={'/img/' + pokemon_id + '.png'} pokedex_id={pokemon_id} />
                            );
                        })}
                    </div>

                    <hr className="my-3" />

                    {/* Duplicate pagination at the bottom so the user doesn't have to scroll up */}
                    <PaginationControls {...paginationProps} />
                </>
            )}
        </div>
    );
}
