# Simple Media Gallery

A production-ready media gallery platform for photos and videos. Media files are stored on the server filesystem — no upload UI required. The app automatically scans configured folders, extracts metadata, generates thumbnails, and presents everything in a beautiful animated gallery.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **HeroUI** + **shadcn/ui** + **Tailwind CSS 4**
- **Framer Motion** for animations
- **Prisma ORM** + **PostgreSQL**
- **Sharp** (images) + **ffprobe/ffmpeg** (video metadata & thumbnails)

## Quick Start

### 1. Prerequisites

- Node.js 20+
- PostgreSQL database
- [ffmpeg](https://ffmpeg.org/) installed (for video thumbnails & metadata)

### 2. Install

```bash
cd D:\OwnProjects\simple-media-gallery
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/media_gallery?schema=public"
MEDIA_ROOT="./media"
PHOTO_FOLDER="photos"
VIDEO_FOLDER="videos"
THUMBNAIL_FOLDER="./.thumbnails"
ADMIN_SECRET="your-secure-secret"
```

### 4. Database Setup

```bash
npm run db:push    # Create tables
# or
npm run db:migrate # With migrations
```

### 5. Add Media

Place files in the configured folders:

```
media/
  photos/     ← jpg, jpeg, png, webp, gif, avif
  videos/     ← mp4, mov, mkv, webm, avi, m4v
```

### 6. Run

```bash
npm run dev      # Development server at http://localhost:5008
npm run scan     # Manual media scan (CLI)
```

## Features

### Media Scanner

- Recursive folder scanning
- SHA-256 file hashing for deduplication
- Detects new, modified, deleted, and duplicate files
- Auto-runs on startup (configurable)
- Manual trigger from admin panel

### Gallery

- Masonry, grid, and list layouts
- Infinite scroll with virtualized rendering
- Instant search across filename, metadata, codec, camera, etc.
- Filters for resolution, orientation, camera, codec, duration, date
- Sort by newest, oldest, name, size, duration, resolution, views

### Viewer

- Full-screen image viewer with zoom, pan, keyboard shortcuts
- Custom video player with seek, speed, PiP, volume
- Video resume from last position (localStorage)
- Metadata sidebar with EXIF / video info
- Shareable deep links (`/view/[id]`)

### Local Device Features (no login)

- Viewed history, favorites, recently played
- Video resume progress
- Layout & theme preferences

### Analytics

- Anonymous device ID tracking
- View counts, search analytics, filter usage
- Privacy-focused — no PII collected

### Admin Panel (`/admin`)

- Media counts, storage usage, scanner status
- Manual scan & thumbnail rebuild
- Broken/missing/duplicate file reports
- Search analytics

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
├── components/
│   ├── gallery/          # Gallery UI components
│   ├── viewer/           # Full-screen media viewer
│   ├── layout/           # Header, navigation
│   ├── providers/        # Theme, stats, scanner
│   └── ui/               # shadcn/ui components
├── constants/            # Media formats, storage keys
├── hooks/                # Gallery, analytics, localStorage
├── lib/
│   ├── security/         # Rate limiting, path validation
│   └── utils/            # Paths, formatting
├── services/
│   ├── scanner/          # File scanner, thumbnails, metadata
│   ├── media/            # Database queries
│   ├── analytics/        # Usage tracking
│   └── admin/            # Dashboard stats
└── types/                # TypeScript interfaces
```

## API Routes

| Route                  | Method   | Description                                        |
| ---------------------- | -------- | -------------------------------------------------- |
| `/api/media`           | GET      | Paginated media list with search/filters           |
| `/api/media/[id]`      | GET      | Single media item + adjacent items                 |
| `/api/media/[id]/file` | GET      | Secure file serving                                |
| `/api/scan`            | POST     | Trigger media scan                                 |
| `/api/analytics`       | POST     | Track anonymous usage                              |
| `/api/admin`           | GET/POST | Admin dashboard (requires `x-admin-secret` header) |

## Security

- Path traversal protection on all file serving
- Rate limiting on API endpoints
- Secure HTTP headers (HSTS, X-Frame-Options, etc.)
- Zod validation on all inputs
- Admin actions audit logged
- Environment validation at startup

## Keyboard Shortcuts (Viewer)

| Key     | Action               |
| ------- | -------------------- |
| `←` `→` | Previous / Next      |
| `Space` | Play / Pause (video) |
| `Esc`   | Close viewer         |
| `F`     | Toggle fullscreen    |

## License

MIT
