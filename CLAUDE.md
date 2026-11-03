# Working on Big Ears

Several Claude chats work on this app, sometimes on the same day. These rules keep anyone from overwriting someone else's work.

## Where the app lives
- `index.html` is the whole app (HTML, CSS and JS in one file). **It is the source. Edit it directly.** There is no build step and no other copy.
- `sw.js` is the service worker: offline cache, network-first, plus the daily nudge push handler.
- `worker/` is the Cloudflare Worker that sends one push nudge a day. GitHub Actions deploys it when `worker/**` changes, then commits `push-config.json` and `worker/last-deploy.log`. Don't edit those two files by hand.
- Live at https://jalthouse2.github.io/big-ears-trainer/ (GitHub Pages, from `main`). Jeff uses it as a home-screen app on his phone.

## The routine, every time
1. **Before you start:** `git pull --rebase`.
2. Make small, focused changes in `index.html`.
3. **Check:** pull the `<script>` blocks out and run `node --check` on them. Then open the page in Playwright at 390×844 (phone size) and look at what you changed. Check for page errors.
4. **Before you push:** `git pull --rebase` again. If there's a conflict, keep both sides' changes. Never discard another chat's work, and never force-push.
5. Commit with a plain message saying what changed for the player, then `git push`.
6. Only bump `CACHE` in `sw.js` when you change `sw.js` itself. The app is fetched network-first, so updates arrive without a bump.

## Theory rules
- Every note is a number relative to the key's home: major home is 1, minor home is 6. The seven "worlds" are the scale started from each number, and the distances never change.
- Don't mention Jojo anywhere in the app.
- Notes the app asks for must fit the playable neck (`fitPlay`).

## Design rules
- Dark "Late Set" look (midnight and brass). Clean and spacious, with a slower, airy sound. The Ethereal voice is the default.
- Transport controls are symbol buttons: ▶ start, → next, ↻ replay, pause, ‹ previous, drone.
- Every game shows the same numbered guide: "Press ▶ to start." … "Press → for the next one.", with the current line lit (see `GUIDE`, `#pg-steps`, `#psteps`).
- Short, plain instructions, one per line. No jargon without an example.
- Instrument (guitar, ukulele, piano) is chosen only in Settings.
- Minimal first: Sonofield is the reference. Show as little as possible; extras go into the options sheet.
- The tonal map (the row of numbers) is the default answer view; circle and neck are optional.
- The numbered guide shrinks to the current line after 3 rounds of a game (`S.gRounds`); tapping it shows all steps.
- After an answer, show "You" and "Answer" rows, each with a speaker button (`slotRow(who,items,act)`, `.rowplay`), so the player can hear the difference.
- Sounds lean ethereal and spacey: Ethereal (default), Shimmer, Glass bells, Choir pad, Bowed strings (`PADS`, `SPACEY()`).

## Product decisions
- Free: Tuner, Rhythm, Chord decoder, Key finder, the Guide, and the first game levels. Paid: everything else, after a 7-day trial. €9.99 a year or €25.99 lifetime ("for as long as Big Ears is offered"). `PAYWALL.on` stays `false` until there's a store version.
- Daily plan (`PLAN`): weeks 1–12 focus on singing, hearing notes in your head and finding them on the guitar. Shapes (triads, shells) and jazz come in weeks 13–16. Song anchors and My songs are optional extras, outside the daily minutes.
- No made-up testimonials anywhere.
