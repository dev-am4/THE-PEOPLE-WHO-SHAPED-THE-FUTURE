# THE PEOPLE WHO SHAPED THE FUTURE

Interactive touchscreen exhibit for **Future Careers Zone** in the astronomy and space exhibition at Nakhon Sawan Science Centre for Education.

## Experience flow

1. Attract screen — large tap-to-start interaction.
2. People gallery — filter by Science, Space, Technology, Creativity.
3. Person detail — Story / DNA of Greatness / Related Careers.
4. Large touch targets, fullscreen control, and automatic kiosk reset after 90 seconds of inactivity.

## People included

- ดร.อาจอง ชุมสาย ณ อยุธยา
- ศ.ดร.วิรุฬห์ สายคณิต
- ศ.นพ.ประเวศ วะสี
- ศ.ดร.ระวี ภาวิไล
- Albert Einstein
- Isaac Asimov
- Neil Armstrong
- Linus Torvalds
- Beeple (Mike Winkelmann)
- Christopher Nolan
- **Elon Musk** — replaces Mark Zuckerberg
- Donald Knuth

## Run locally

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
```

The project is a Vite + React single-page application and includes `vercel.json` for SPA routing on Vercel.

## Portrait assets

International public figures currently use Wikimedia Commons `Special:FilePath` URLs with an automatic initial-based fallback if an image cannot load. Thai figures intentionally use the built-in fallback until approved exhibit portraits are supplied. For production installation, replace these with approved local assets under `public/people/` to avoid depending on internet access.

## Content note

The radar values are **exhibit interpretation values**, not scientific assessments of the individuals. The UI explicitly labels the chart accordingly.
