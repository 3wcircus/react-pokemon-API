/**
 * Pokemon.jsx — Single Pokémon card for the Pokédex grid.
 *
 * Renders one tile containing the Pokémon's name and its local sprite image.
 * Clicking the image navigates to the detail page via React Router's <Link>,
 * which avoids a full page reload and keeps navigation client-side.
 *
 * Props:
 *   pokemon    {string}        — Pokémon name in lowercase (e.g. "bulbasaur").
 *                                CSS text-transform: capitalize handles display casing.
 *   image      {string}        — Relative path to the local sprite (e.g. "/img/1.png").
 *                                Sprites are stored in public/img/ and served statically.
 *   pokedex_id {string|number} — National Pokédex ID extracted from the PokéAPI URL.
 *                                Used to build the /pokemon/:id detail route.
 */
import { Link } from 'react-router-dom';

export default function Pokemon({ pokemon, image, pokedex_id }) {
    return (
        <div className="pokemon grid-element">
            {/* Name — CSS handles capitalization so the raw lowercase API value is fine */}
            <h2>{pokemon}</h2>

            {/* Wrapping the image in <Link> makes the whole sprite clickable */}
            <Link to={'/pokemon/' + pokedex_id}>
                <img src={image} alt={pokemon} />
            </Link>
        </div>
    );
}
