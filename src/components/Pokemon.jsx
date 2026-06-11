import { Link } from 'react-router-dom';

export default function Pokemon({ pokemon, image, pokedex_id }) {
    return (
        <div className="pokemon grid-element">
            <h2>{pokemon}</h2>
            <Link to={'/pokemon/' + pokedex_id}>
                <img src={image} alt={pokemon} />
            </Link>
        </div>
    );
}
