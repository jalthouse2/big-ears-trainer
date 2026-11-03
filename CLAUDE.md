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
- Before a game starts, only the big ▶ shows, pulsing, with "Press to start" beside it (`startCue`, `.cue`). After that, every game shows the same numbered guide ending "Press → for the next one.", with the current line lit (see `GUIDE`, `#pg-steps`, `#psteps`).
- Short, plain instructions, one per line. No jargon without an example.
- Instrument (guitar, ukulele, piano) is chosen only in Settings.
- Minimal first: Sonofield is the reference. Show as little as possible; extras go into the options sheet.
- The tonal map (the row of numbers) is the default answer view; circle and neck are optional.
- The numbered guide shrinks to the current line after 3 rounds of a game (`S.gRounds`); tapping it shows all steps.
- After an answer, show "You" and "Answer" rows, each with a speaker button (`slotRow(who,items,act)`, `.rowplay`), so the player can hear the difference.
- Chord words, the same everywhere: chords sound either as "1 3 5" (basic) or "1 3 5 7" (7ths), one top pill where chords play (`csize`, Chord chart, Note over chord, Progressions). Shells (1 3 7) and Triads (1 3 5 on three strings) are ways to play a chord, so they only appear in Chords on the neck, whose pill is Standard · Triads · Shells · Quiz.
- Top bar in games: only the key, the gig pill (tour level plus difficulty) and, where chords play, the 1 3 5 / 1 3 5 7 pill. The tour decides home (major, minor, modes); difficulty (pace) is chosen in the gig sheet before you play.
- Settings are grouped in sections that open and close (`.setsec`): Instrument, Key and numbers, Hearing the key, Sound, Drone, Microphone, Practice reminder, Progress and levels, Help. New settings go in the right section.
- Bottom nav: Home · Path · Games · Tools · More. Home stays short: Today, Your path, Weekly challenge. Games (`scr-games`) lists every game. Path (`scr-path`) shows tours, gigs, rings and a "Next gig" Play button. More (`scr-more`) holds Profile (`scr-profile`), Stats and badges, Settings, Guide, Welcome intro, About (`scr-about`: what it is, what's free, your data, tips, share). Keep About in step when pricing or data handling changes. The settings gear only shows inside games; elsewhere Settings is in More. Songs live at the end of Tools.
- The microphone is one remembered on/off switch (`S.micAuto`): the mic button in a game and "Microphone on" in Settings are the same thing. No headphones option: echo cancelling stays on, so it works with or without headphones.
- Leaving a game turns the drone off at once.
- Audio runs through headroom, a gentle compressor and a limiter (`ensure()`), with `latencyHint:'playback'`, so it never crackles. Keep new voices quiet enough not to stack into clipping.
- Encourage generously: right answers show a line from `CHEER` via `cheer(streak)`, four tiers that grow with the streak (some jazz-flavoured, no real musicians' names). No paragraph longer than two sentences in the intro.
- Sounds lean ethereal and spacey: Ethereal (default), Shimmer, Glass bells, Choir pad, Bowed strings (`PADS`, `SPACEY()`).

## Product decisions
- Free: Tuner, Rhythm, Chord decoder, Key finder, the Guide, and the first game levels. Paid: everything else, after a 7-day trial. €9.99 a year or €25.99 lifetime ("for as long as Big Ears is offered"). `PAYWALL.on` stays `false` until there's a store version.
- Daily plan (`PLAN`): weeks 1–12 focus on singing, hearing notes in your head and finding them on the guitar. Shapes (triads, shells) and jazz come in weeks 13–16. Song anchors and My songs are optional extras, outside the daily minutes.
- The path chooses the game: gigs alternate Single notes (Name the number) and Notes over chords (`gigGame`). The path is a band's world tour: each world is named by its home number and feel (`tourName`: World 1 · Bright, World 6 · Moody, World 2 · Soulful, World 3 · Spanish, World 4 · Dreamy, World 5 · Bluesy, World 7 · Edgy). Say "world", not "tour", for each one; the mode name (Dorian etc.) is only a small footnote.
- Daily challenge (`DAILY`, `chalStart`): 20 notes, same for everyone each day (seeded by date), rated out of 5 stars with halves (Mon 1, Tue 1.5, Wed 2.5, Thu 3, Fri 3.5, Sat 4.5, Sun 5), harder from Monday (1 3 5 6, relaxed) to Sunday (all twelve, a surprise world, fast). One try per note. The end screen reviews every note and each miss, with replay, and shares a green/red grid.
- No made-up testimonials anywhere.
