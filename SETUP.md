# Setup Instructions

## Project Overview

DataForge is a static browser-based learning application. It does not require a notebook, Python model service, Node backend, database, or API server.

## Requirements

- A modern desktop browser with JavaScript and WebGL enabled.
- Python 3.x for the simplest local static server, or any equivalent HTTP server.
- Internet access for CSS files that load the **Manrope** font from Google Fonts.
- Local GLB, image, and bundled Three.js assets are served directly from the repository.

## Run Locally

From the repository root containing `index.html`, run:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000/
```

VS Code Live Server and equivalent local static-server tools are also supported.

## HTTP Serving

The project loads JavaScript modules and GLB assets. Browser security rules can block or alter module and asset behavior when pages are opened directly with `file://`, so the project is served over HTTP.

## Regenerate the Root Web GLB

The repository includes:

```text
tools/build_web.py
```

Run:

```bash
python tools/build_web.py
```

This regenerates:

```text
assets/interconnected-web.glb
```

using Python standard-library code.

## Runtime Structure

The submitted application is client-side. No notebook-specific environment, local model checkpoint, backend process, database migration, or API credential is required for the documented version.
