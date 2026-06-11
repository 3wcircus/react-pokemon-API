/**
 * view-pokemon.jsx — Pokémon detail page
 *
 * Displays full information for a single Pokémon identified by the :id
 * route parameter (National Pokédex number, e.g. /pokemon/25 for Pikachu).
 *
 * Data is loaded in two tiers:
 *   1. On mount: fetch the main Pokémon record from PokéAPI. This provides
 *      sprites, types, stats, and the names + URLs of abilities and moves.
 *   2. On demand: when the user clicks an ability or move button, its detail
 *      URL is fetched to retrieve the English short_effect description.
 *      This avoids fetching hundreds of move descriptions up front.
 *
 * The modal is implemented with React state rather than Bootstrap's JS
 * module — setting modal state to a non-null value shows it; null hides it.
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../App.css';
import "bootstrap/dist/css/bootstrap.min.css";

/**
 * ViewPokemon — Detail view for a single Pokémon.
 *
 * State:
 *   pokemon {object|null} — Full Pokémon record from PokéAPI, or null while loading.
 *                           Shape mirrors the PokéAPI /pokemon/{id} response.
 *   modal   {object|null} — Controls the description popup.
 *                           { title: string, description: string|null }
 *                           description is null while the fetch is in flight (shows spinner),
 *                           then replaced with the text once the request resolves.
 */
export default function ViewPokemon() {
    // :id from the URL — the National Pokédex number (e.g. "25")
    const { id } = useParams();

    const [pokemon, setPokemon] = useState(null);

    // null  → modal closed
    // { title, description: null }    → modal open, description loading
    // { title, description: string }  → modal open, description ready
    const [modal, setModal] = useState(null);

    /**
     * Fetch the main Pokémon data whenever the :id route param changes.
     * The dependency array [id] ensures this re-runs if the user navigates
     * directly between detail pages without going back to the list first.
     */
    useEffect(() => {
        fetch('https://pokeapi.co/api/v2/pokemon/' + id)
            .then(r => r.json())
            .then(setPokemon)
            .catch(console.error);
    }, [id]);

    /**
     * Opens the description modal and fetches the ability/move description.
     *
     * The modal is shown immediately with a spinner (description: null) so the
     * user gets instant feedback, then updated once the fetch resolves.
     * effect_entries is an array of descriptions for multiple languages;
     * we find the English one and prefer short_effect over the full-length effect.
     *
     * @param {string} name — Display name of the ability or move
     * @param {string} url  — PokéAPI URL to fetch the description from
     */
    const openModal = (name, url) => {
        // Show the modal immediately with a loading spinner
        setModal({ title: name, description: null });

        fetch(url)
            .then(r => r.json())
            .then(data => {
                // Find the English effect entry — other languages are present but not needed
                const entry = data.effect_entries?.find(e => e.language.name === 'en');
                setModal({ title: name, description: entry?.short_effect ?? 'No description available.' });
            })
            .catch(() => setModal({ title: name, description: 'Failed to load description.' }));
    };

    // Show a centred spinner while the main Pokémon data is loading
    if (!pokemon) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    /**
     * Official artwork from the PokéAPI "other" sprites object.
     * The key uses bracket notation because "official-artwork" contains a hyphen.
     * Falls back to a text placeholder if no artwork URL is available.
     */
    const artwork = pokemon.sprites.other?.['official-artwork']?.front_default;

    /**
     * Build the list of game sprites to display below the artwork.
     * We filter out any null entries — not all Pokémon have every variant
     * (e.g. some Gen 1 Pokémon lack a shiny back sprite).
     */
    const sprites = [
        { src: pokemon.sprites.front_default, label: 'Front' },
        { src: pokemon.sprites.back_default,  label: 'Back' },
        { src: pokemon.sprites.front_shiny,   label: 'Shiny' },
        { src: pokemon.sprites.back_shiny,    label: 'Shiny Back' },
    ].filter(s => s.src);

    return (
        <div className="container py-4">

            {/* ── Header: number, name, type badges ─────────────────────────── */}
            <div className="text-center mb-3">
                {/* Zero-pad the ID to 3 digits (e.g. 25 → #025) */}
                <p className="text-muted mb-0 fs-5">#{String(pokemon.id).padStart(3, '0')}</p>
                <h1 className="text-capitalize fw-bold display-5">{pokemon.name}</h1>

                {/* Type badges — colour classes (e.g. type-fire) are defined in App.css */}
                <div className="d-flex justify-content-center gap-2 mt-1">
                    {pokemon.types.map(t => (
                        <span key={t.type.name} className={`badge fs-6 type-${t.type.name}`}>
                            {t.type.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Official artwork ──────────────────────────────────────────── */}
            <div className="text-center mb-2">
                {artwork
                    ? <img src={artwork} alt={pokemon.name}
                        style={{ width: 240, filter: 'drop-shadow(2px 6px 10px rgba(0,0,0,0.25))' }} />
                    : <div className="text-muted py-4">No artwork available</div>
                }
            </div>

            {/* ── Game sprites (front, back, shiny variants) ────────────────── */}
            {/*
                imageRendering: pixelated preserves the crisp look of the low-resolution
                game sprites when they are scaled up — without it browsers apply blurring.
            */}
            <div className="d-flex justify-content-center gap-4 flex-wrap mb-5">
                {sprites.map(s => (
                    <div key={s.label} className="text-center">
                        <img src={s.src} alt={s.label} style={{ width: 80, imageRendering: 'pixelated' }} />
                        <div><small className="text-muted">{s.label}</small></div>
                    </div>
                ))}
            </div>

            {/* ── Three-column info cards ───────────────────────────────────── */}
            <div className="row g-4">

                {/* Base Stats — progress bar width = stat / 255 (the maximum base stat value) */}
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-header fw-semibold">Base Stats</div>
                        <div className="card-body">
                            {pokemon.stats.map(s => (
                                <div key={s.stat.name} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <small className="text-capitalize text-muted">{s.stat.name}</small>
                                        <small className="fw-bold">{s.base_stat}</small>
                                    </div>
                                    {/* 255 is the theoretical maximum base stat (used by HP Blissey etc.) */}
                                    <div className="progress" style={{ height: 7 }}>
                                        <div
                                            className="progress-bar"
                                            style={{ width: `${(s.base_stat / 255) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Abilities — each button triggers an on-demand description fetch */}
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-header fw-semibold">
                            Abilities <small className="fw-normal text-muted">(click for description)</small>
                        </div>
                        <div className="card-body">
                            {pokemon.abilities.map(a => (
                                <button
                                    key={a.ability.name}
                                    className="btn btn-outline-primary btn-sm me-2 mb-2 text-capitalize"
                                    onClick={() => openModal(a.ability.name, a.ability.url)}
                                >
                                    {a.ability.name}
                                    {/* Hidden abilities are rarer and obtained through special means */}
                                    {a.is_hidden && (
                                        <span className="ms-1 badge bg-secondary" style={{ fontSize: '0.65em' }}>
                                            hidden
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Moves — scrollable because some Pokémon learn 80+ moves across all games */}
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-header fw-semibold">
                            Moves <small className="fw-normal text-muted">(click for description)</small>
                        </div>
                        <div className="card-body" style={{ maxHeight: 280, overflowY: 'auto' }}>
                            {pokemon.moves.map(m => (
                                <button
                                    key={m.move.name}
                                    className="btn btn-outline-success btn-sm me-2 mb-2 text-capitalize"
                                    onClick={() => openModal(m.move.name, m.move.url)}
                                >
                                    {m.move.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Description modal ─────────────────────────────────────────── */}
            {/*
                Bootstrap modal classes are used for styling, but Bootstrap's JS is not.
                Visibility is controlled entirely by React state: modal !== null = visible.
                Clicking the backdrop (outer div) closes the modal; stopPropagation on the
                inner dialog prevents clicks inside the card from bubbling up and closing it.
            */}
            {modal && (
                <div
                    className="modal d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setModal(null)}                    // Click backdrop → close
                >
                    <div className="modal-dialog modal-dialog-centered"
                        onClick={e => e.stopPropagation()}            // Prevent backdrop click from firing
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-capitalize">{modal.title}</h5>
                                <button type="button" className="btn-close" onClick={() => setModal(null)} />
                            </div>
                            <div className="modal-body">
                                {/* Show spinner while description is null (fetch in flight) */}
                                {modal.description
                                    ? modal.description
                                    : <div className="text-center"><div className="spinner-border spinner-border-sm" /></div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
