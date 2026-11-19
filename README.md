# Vice Platinum Atlas

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/cahya23/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/cahya23/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver and 46 bronze (28 hidden). Every trophy is shown with its official name, description and grade as PlayStation publishes them, plus a guide in our own words that cites its sources.

## What it does

- **Tracker** — a checklist of all 55 trophies. Progress is saved in the browser (localStorage) and can be exported to a JSON file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, combat, exploration, money), by grade, by earned status, and by search.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to Platinum** — a 7-stage roadmap built from the official descriptions: which story chapters and missions, which collectibles and counts, in what order.
- **Missables** — 22 missable trophies flagged, with when each can be missed.
- **Cited guides** — each trophy's guide names its sources (the official list on Exophase, PSNProfiles for PSN's counts). Where a place or step is not yet verified in the game, the guide says so plainly instead of inventing it.

## Run it

Static files under `app/`, no build step, no network requests at run time:

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. It works with the network off.

## Screenshots

Four screenshots of the guide are in `screenshots/`: the checklist, a trophy guide open with its sources, the roadmap, and the spoiler setting at work.

## Competition

Built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01). The entry program is `main.ts` (Node 22, standard library only): it copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.

## License

MIT — see `LICENSE`.
