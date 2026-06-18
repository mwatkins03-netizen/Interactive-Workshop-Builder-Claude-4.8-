# AI Literacy Activity Toolkit

Interactive, editable activities you can embed in PowerPoint and Google Slides,
themed for **AI literacy for faculty**. Attendees respond on their own devices and
get a personal **summary** (HTML / PDF / Print) at the end.

Created by **Marc Watkins**. Built with the help of an AI assistant (Anthropic
Claude); content reviewed and curated by Marc Watkins (transparent AI disclosure
shown on every page).

Inspired by the structure of the *Analog Learning* workshop:
<https://mwatkins03-netizen.github.io/Analog-Learning-Presentation-Claude-5-/>

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | **Hub / builder** — create, edit, reorder, preview activities; get embed codes; export/import config. |
| `activity.html` | **Renderer** — shows one activity, sized to drop into an iframe. `activity.html?id=ACTIVITY_ID` |
| `summary.html` | **Attendee overview** — every saved response, with Print / Download PDF / Save HTML. |
| `results.html` | **Presenter live view** — `results.html?session=CODE`, auto-refreshing aggregates. |
| `qr.html` | **Printable QR sheet** — one scannable code per activity; auto-detects the host URL. |
| `assets/config.js` | The editable content (activities). Replace this to publish your edits. |
| `assets/app.js` | Engine + activity types. |
| `assets/theme.css` | "Future Tech" visual theme. |

## Activity types (13)

`spectrum` (slider) · `tally` (counters) · `sort` (drag into buckets) ·
`poll` (single/multi choice) · `rating` (1–N stars) · `shorttext` (open response) ·
`reflection` (multi-prompt take-home card) · `wordcloud` (collect words) ·
`ranking` (order by priority) · `likert` (agreement across statements) ·
`quiz` (knowledge check with feedback + explanation) · `dotvote` (allocate a budget of dots) ·
`emoji` (reaction pulse-check).

All are editable in the hub — title, prompt, options, labels, colors — and each has its
own icon shown in the builder and type picker.

## Visual theme

"HERETIC" retro screen-print look (inspired by the G.A.R.M. Co. posters): cream paper,
bright teal/green, vermilion red-orange, black, with magenta + gold pops; flat colors,
bold black borders, hard "sticker" shadows, Anton display type. Edit `assets/theme.css`
to adjust the palette (CSS variables at the top).

## How responses & editing work (no server needed)

- **Editing**: your changes save automatically to this browser. To publish them for
  attendees, click **Export config.js** in the hub and replace `assets/config.js` in
  your repo (or **Export config.json** to back up).
- **Responses** work in two modes:
  - **Offline (default):** answers are stored only in each attendee's browser
    (`localStorage`); `summary.html` shows them their personal recap. No backend.
  - **Live session (optional):** when a session code is set on the hub, answers are
    *also* sent to a Supabase backend so the presenter can watch aggregated results
    update in real time on `results.html`. See **Live results** below.

## Deploy (GitHub Pages)

1. Put this folder in a repo (e.g. push to GitHub).
2. Settings → Pages → deploy from the `main` branch root.
3. Your activities live at `https://<you>.github.io/<repo>/activity.html?id=where-we-stand`.

## Embedding

- **Hub → each activity → "Embed"** gives you: a direct link, an `<iframe>` snippet,
  and a QR-code link.
- **Hub → "QR sheet"** (`qr.html`) makes a printable page with a QR for every activity
  (plus optional summary/live-results codes). Print it from your office before the
  workshop — set the Base URL to your live Pages site first, not `localhost`.
- **Google Slides**: no native web embed — use a "web page / iframe" add-on with the
  activity URL, or link a shape/image to the URL to open it full-screen while presenting.
- **PowerPoint**: Insert → Add-ins → a "Web Viewer" add-in, paste the URL; or
  Insert → Link on a shape.
- **Live**: open the activity URL in a browser tab full-screen; show the QR so
  attendees respond on their devices.

## End-of-session summary (per attendee)

Link attendees to `summary.html` (also reachable from any activity via "My summary →").
Buttons: **Print** (→ Save as PDF), **Download PDF** (jsPDF), **Save as HTML**.

## Live results (presenter view)

For collecting the whole room's responses in real time:

1. On the **hub**, set a **Session code** (or click "New code"). A status badge shows
   "Live: CODE" when the backend is connected.
2. Share the activities while the code is set — every **Embed** link/iframe/QR now
   carries `&session=CODE`, so attendees' answers are tagged to your session.
3. Click **"Open live results →"** (or visit `results.html?session=CODE`) and put it on
   the projector. It auto-refreshes every 5 seconds and aggregates every activity type
   (bars, averages, word cloud, ranking, sort majority, dot tallies, free-text lists).

**Backend:** a Supabase project (table `ailit_responses`) configured in
`assets/cloud.js`. The publishable key there is safe to ship publicly; row access is
governed by RLS policies (anonymous attendees may add/update their own answers and read
a session's responses; **no deletes**).

**Privacy note:** because attendees are anonymous, anyone who knows a session code (and
the public key in `cloud.js`) can read that session's responses, including any free
text people type. This is fine for typical non-sensitive workshop prompts. Use fresh
codes per workshop, avoid prompts that collect personal/sensitive info, and delete old
data from the Supabase dashboard when done. To turn the backend off entirely, blank out
`URL_`/`KEY` in `assets/cloud.js` (the toolkit then runs offline-only).

**Point at your own Supabase project:** replace `URL_` and `KEY` in `assets/cloud.js`
with your project's API URL + publishable key, and create the same table/policies.

## Deploy includes the live view too

After GitHub Pages is live, your URLs are:
- Hub: `https://<you>.github.io/<repo>/`
- Activity: `…/activity.html?id=where-we-stand`
- Live results: `…/results.html?session=CODE`
- Attendee summary: `…/summary.html`
