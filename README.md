# React Pokédex

A Pokédex web app built with React and the [PokéAPI](https://pokeapi.co). Browse all Pokémon, search by name, sort by number or alphabetically, and view detailed stats, abilities, and moves for each Pokémon.

## Features

- **Pokédex list** — paginated grid of all 1300+ Pokémon with sprites
- **Search** — live filter by name across the full Pokédex
- **Sort** — toggle between Pokédex number order and A–Z alphabetical
- **Detail page** — official artwork, game sprites (front/back/shiny), base stats, type badges
- **Ability & move descriptions** — click any ability or move to fetch and display its description in a popup

## Tech Stack

- [React 19](https://react.dev) with functional components and hooks
- [React Router v7](https://reactrouter.com) for client-side routing
- [Bootstrap 5](https://getbootstrap.com) for layout and UI components
- [Vite](https://vite.dev) for bundling and dev server
- [PokéAPI](https://pokeapi.co) for all Pokémon data

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Other Commands

```bash
npm run build      # Production build → dist/
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
```

## Project Structure

```
src/
  App.jsx                      # Router, navbar with context-aware back button
  App.css                      # Grid layout and Pokémon type badge colors
  main.jsx                     # App entry point
  components/
    list-pokemon.jsx           # Pokédex list with search, sort, and pagination
    view-pokemon.jsx           # Pokémon detail page
    Pokemon.jsx                # Individual Pokémon card (used in list)
public/
  img/                         # Local Pokémon sprite images (1.png–10089.png)
```

## Notes

- Pokémon sprites are served from local files in `public/img/`. The list fetches all Pokémon names upfront in a single API call so search and sort are instant with no additional requests.
- Ability and move descriptions are fetched on demand from the PokéAPI when clicked.
