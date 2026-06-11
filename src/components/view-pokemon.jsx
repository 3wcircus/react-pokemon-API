import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../App.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function ViewPokemon() {
    const { id } = useParams();
    const [pokemon, setPokemon] = useState(null);
    const [modal, setModal] = useState(null); // { title, description } — null = description loading

    useEffect(() => {
        fetch('https://pokeapi.co/api/v2/pokemon/' + id)
            .then(r => r.json())
            .then(setPokemon)
            .catch(console.error);
    }, [id]);

    const openModal = (name, url) => {
        setModal({ title: name, description: null });
        fetch(url)
            .then(r => r.json())
            .then(data => {
                const entry = data.effect_entries?.find(e => e.language.name === 'en');
                setModal({ title: name, description: entry?.short_effect ?? 'No description available.' });
            })
            .catch(() => setModal({ title: name, description: 'Failed to load description.' }));
    };

    if (!pokemon) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    const artwork = pokemon.sprites.other?.['official-artwork']?.front_default;
    const sprites = [
        { src: pokemon.sprites.front_default, label: 'Front' },
        { src: pokemon.sprites.back_default, label: 'Back' },
        { src: pokemon.sprites.front_shiny, label: 'Shiny' },
        { src: pokemon.sprites.back_shiny, label: 'Shiny Back' },
    ].filter(s => s.src);

    return (
        <div className="container py-4">
            {/* Name + number + types */}
            <div className="text-center mb-3">
                <p className="text-muted mb-0 fs-5">#{String(pokemon.id).padStart(3, '0')}</p>
                <h1 className="text-capitalize fw-bold display-5">{pokemon.name}</h1>
                <div className="d-flex justify-content-center gap-2 mt-1">
                    {pokemon.types.map(t => (
                        <span key={t.type.name} className={`badge fs-6 type-${t.type.name}`}>
                            {t.type.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Official artwork */}
            <div className="text-center mb-2">
                {artwork
                    ? <img src={artwork} alt={pokemon.name}
                        style={{ width: 240, filter: 'drop-shadow(2px 6px 10px rgba(0,0,0,0.25))' }} />
                    : <div className="text-muted py-4">No artwork available</div>
                }
            </div>

            {/* Game sprites */}
            <div className="d-flex justify-content-center gap-4 flex-wrap mb-5">
                {sprites.map(s => (
                    <div key={s.label} className="text-center">
                        <img src={s.src} alt={s.label} style={{ width: 80, imageRendering: 'pixelated' }} />
                        <div><small className="text-muted">{s.label}</small></div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                {/* Base stats */}
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

                {/* Abilities */}
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

                {/* Moves */}
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

            {/* Description popup */}
            {modal && (
                <div
                    className="modal d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setModal(null)}
                >
                    <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-capitalize">{modal.title}</h5>
                                <button type="button" className="btn-close" onClick={() => setModal(null)} />
                            </div>
                            <div className="modal-body">
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
