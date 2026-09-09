# Setup Instructions

## Current uploaded project

This source is a static browser application. The uploaded archive does **not** contain a notebook, Python model service, Node backend, database, or API server that must be started.

## Requirements

- A modern desktop browser with JavaScript and WebGL enabled.
- Python 3.x for the simplest local static server, or any equivalent HTTP server.
- Internet access is currently useful because several CSS files import **Manrope** from Google Fonts. Local GLB, image, and bundled Three.js assets are served from the repository.

## Run locally

From the repository root (the folder containing `index.html`):

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Alternative: VS Code Live Server or another static-server extension.

## Why `file://` is not recommended

The main page loads JavaScript modules and GLB assets. Browser security rules can block or alter module/asset behavior when the page is opened directly from the filesystem. Serve it over HTTP.

## Regenerate the root web GLB

The repository includes:

```text
tools/build_web.py
```

Run:

```bash
python tools/build_web.py
```

It regenerates:

```text
assets/interconnected-web.glb
```

using Python standard-library code.

## No notebook/local model component detected

There is therefore no notebook-specific setup to document for this version. If a notebook, backend, model checkpoint, or external API is added later, update this file with exact versions, commands, environment variables, and expected outputs.

## Pre-deployment check

The uploaded archive is currently missing several lesson HTML entry pages referenced by navigation. Restore them before judging, then test every navigation target from a clean browser session.
