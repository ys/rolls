# Rolls

A CLI tool for film photographers to organize, archive, and manage scanned film rolls.

![Contact Sheet Example](https://user-images.githubusercontent.com/483012/200196756-3d2f85fe-ec62-42f7-8240-01d4de845e2f.png)

## What It Does

Rolls helps you maintain a structured archive of your film photography by:

- **Organizing scans** - Rename files and folders based on metadata
- **Adding EXIF data** - Embed camera, film, and date information into your images
- **Generating contact sheets** - Create visual overviews of each roll
- **Syncing with Obsidian** - Keep your notes in sync with roll metadata
- **Managing your gear** - Track cameras and film stocks in your collection

Each roll is defined by a simple markdown file with YAML frontmatter containing metadata like camera, film stock, shot date, and tags.

## Repository Structure

This is a monorepo containing:
- **Web app** (root) - Next.js application for managing rolls from any device
- **Go CLI** (`cli/`) - Local command-line tool for processing scans

## Installation

### CLI Tool

```bash
go install github.com/ys/rolls/cli/cmd/rolls@latest
```

Or build from source:

```bash
git clone https://github.com/ys/rolls
cd rolls/cli
go build -o rolls ./cmd/rolls
```

### Web App

See deployment instructions in `IMPLEMENTATION_COMPLETE.md`

## Configuration

Create a config file at `~/.config/rolls/config.yml`:

```yaml
scans_path: ~/Pictures/Film/Scans
contact_sheet_path: ~/Pictures/Film/ContactSheets
obsidian_rolls_path: ~/Notes/Photography/Rolls
brand_name: "YOUR BRAND"
author_name: "Your Name"
```

## Usage

### List Rolls

```bash
# List all rolls
rolls list

# Filter by year
rolls list --year 2024

# Compact output
rolls list --compact
```

### Process Rolls

Process rolls to rename files, add EXIF data, and generate contact sheets:

```bash
# Process all rolls
rolls process

# Process specific rolls
rolls process 24x001 24x002

# Process rolls from a specific year
rolls process --year 2024

# Only update EXIF data (skip renaming)
rolls process --exif-only
```

### Archive Rolls

Mark rolls as archived in their metadata:

```bash
# Archive all rolls
rolls archive

# Archive specific rolls
rolls archive 24x001

# See which rolls aren't archived yet
rolls archive:missing
```

### Generate Contact Sheets

```bash
# Generate contact sheet images
rolls contactsheet

# Generate printable PDFs with header info
rolls contactsheet:pdf

# Filter by year
rolls contactsheet --year 2024
```

### Sync with Obsidian

Copy roll metadata to your Obsidian vault:

```bash
# Sync all rolls
rolls sync

# Preview changes without modifying files
rolls sync --dry-run
```

### Manage Cameras & Film

```bash
# List cameras
rolls cameras

# Add a new camera
rolls cameras:create

# List film stocks
rolls films

# Add a new film stock
rolls films:create
```

## Roll Metadata

Each roll folder contains a `roll.md` file with YAML frontmatter:

```yaml
---
roll_number: "24x001"
camera_id: leica-m6
film_id: portra-400
shot_at: 2024-03-15
scanned_at: 2024-03-20
tags:
  - travel
  - street
---
Notes about this roll...
```

## Interactive TUI

Rolls also includes an interactive terminal UI for browsing and managing your collection:

```bash
rolls ui
```

![TUI Screenshot](https://user-images.githubusercontent.com/483012/200196761-16409f37-c6dd-4b26-b45b-97310bdca05c.png)

## Web App & Full Workflow

The web app (Next.js at repository root) runs on Heroku and acts as the always-on source of truth, accessible from any device (iPhone, browser). The CLI (in `cli/`) handles local file archiving and syncing.

### Full roll lifecycle

```
1. Load roll        → Create roll in web app (iPhone or browser)
2. Fridge           → Tap "Move to Fridge" in web app
3. Lab              → Tap "Send to Lab", enter lab name
4. Scanned          → Lab returns scans; mark scanned in web app
5. Process locally  → rolls process (rename + EXIF + contact sheet)
6. Push to web      → rolls push (sync data + upload contact sheets)
7. Processed        → Mark in web app when Lightroom editing done
8. Archived         → Mark when negatives are physically stored
```

### Web app setup

```bash
# Set web app URL and API key in config
web_app_url: https://your-app.vercel.app
web_app_api_key: <your-api-key>
```

### Sync commands

```bash
# Push local files → web app (data + contact sheet images)
rolls push

# Reconcile local roll files to use canonical camera/film IDs
rolls reconcile
```

### Local processing pipeline

When scans arrive from the lab, run the full processing pipeline:

```bash
# 1. Rename scan files to canonical format:
#    {roll_number}_{frame:04d}.tiff
#    e.g. 24x32_0001.tiff, 24x32_0002.tiff, ...
rolls process 24x32

# 2. Embed EXIF metadata into each image:
#    - Camera make/model
#    - Film stock (in EXIF UserComment / ImageDescription)
#    - Copyright and author
#    - Date from shot_at frontmatter
rolls process --exif-only 24x32

# 3. Generate contact sheet (.webp) for web display:
rolls contactsheet 24x32

# 4. Push everything to the web app:
rolls push
```

### File naming convention

Scans land in `{scans_path}/{roll_number}/` as raw files from the scanner.
After `rolls process`, each frame is renamed:

```
{scans_path}/
  24x32/
    roll.md               ← metadata + notes
    24x32_0001.tiff       ← frame 1
    24x32_0002.tiff       ← frame 2
    ...
```

Contact sheets are written to:

```
{contact_sheet_path}/
  images/
    24x32.webp            ← uploaded to Supabase Storage by rolls push
```

### EXIF data written

| Field | Value |
|-------|-------|
| `Make` | Camera brand (e.g. `Leica`) |
| `Model` | Camera model (e.g. `M6`) |
| `Artist` | `author_name` from config |
| `Copyright` | `copyright` from config |
| `DateTimeOriginal` | `shot_at` from roll frontmatter |
| `UserComment` | Film stock name (e.g. `Kodak Portra 400`) |
| `ImageDescription` | `{brand_name} — {roll_number} — {film}` |

### Canonical IDs

Cameras and films are stored in `~/.config/rolls/cameras.yml` and `films.yml` with kebab-case IDs (e.g. `leica-m6`, `portra-400`). Obsidian notes use human-readable names; `rolls reconcile` rewrites them to canonical IDs before a push.

## License

See [LICENSE](LICENSE) file.
