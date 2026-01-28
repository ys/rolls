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

## Installation

```bash
go install github.com/ys/rolls/cmd/rolls@latest
```

Or build from source:

```bash
git clone https://github.com/ys/rolls
cd rolls
go build -o rolls ./cmd/rolls
```

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

## License

See [LICENSE](LICENSE) file.
