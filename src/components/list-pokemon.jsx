import { useState, useEffect } from 'react';
import '../App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Pokemon from './Pokemon';

const PAGE_SIZE = 40;

function PaginationControls({ page, totalPages, count, start, end, onPageChange }) {
    return (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span className="text-muted small">
                {count > 0 ? `Showing ${start}–${end} of ${count} Pokémon` : ''}
            </span>
            {totalPages > 1 && (
                <div className="d-flex gap-2 align-items-center">
                    <button className="btn btn-outline-secondary btn-sm"
                        disabled={page === 0}
                        onClick={() => onPageChange(page - 1)}>
                        ← Prev
                    </button>
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

const idFromUrl = (url) => parseInt(url.split('/').filter(Boolean).pop(), 10);

export default function ListPokemon() {
    const [allPokemon, setAllPokemon] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('number');
    const [page, setPage] = useState(0);

    useEffect(() => {
        fetch('https://pokeapi.co/api/v2/pokemon?limit=2000')
            .then(r => r.json())
            .then(data => setAllPokemon(data.results));
    }, []);

    const filtered = allPokemon
        .filter(p => p.name.includes(search.toLowerCase().trim()))
        .sort((a, b) => sort === 'name'
            ? a.name.localeCompare(b.name)
            : idFromUrl(a.url) - idFromUrl(b.url)
        );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const start = page * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE + PAGE_SIZE, filtered.length);
    const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const goToPage = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (value) => {
        setSearch(value);
        setPage(0);
    };

    const handleSort = (value) => {
        setSort(value);
        setPage(0);
    };

    const paginationProps = { page, totalPages, count: filtered.length, start, end, onPageChange: goToPage };

    return (
        <div className="px-4 py-3">
            {/* Search + sort toolbar */}
            <div className="d-flex gap-3 align-items-center mb-3 flex-wrap">
                <div className="flex-grow-1">
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Search Pokémon by name…"
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                    />
                </div>
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

            {allPokemon.length === 0 ? (
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <p className="fs-5 mb-2">No Pokémon found for &ldquo;{search}&rdquo;</p>
                    <button className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleSearch('')}>
                        Clear search
                    </button>
                </div>
            ) : (
                <>
                    <PaginationControls {...paginationProps} />
                    <div className="grid-container grid-container--fill mt-3">
                        {pageItems.map((pokemon) => {
                            const pokemon_id = idFromUrl(pokemon.url);
                            return (
                                <Pokemon key={pokemon.name} pokemon={pokemon.name}
                                    image={'/img/' + pokemon_id + '.png'} pokedex_id={pokemon_id} />
                            );
                        })}
                    </div>
                    <hr className="my-3" />
                    <PaginationControls {...paginationProps} />
                </>
            )}
        </div>
    );
}
