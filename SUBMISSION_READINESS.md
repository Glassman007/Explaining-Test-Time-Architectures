# Submission Readiness

## Completed in this package

- Complete submission-oriented `README.md`.
- `BLOG.pdf` with claim-level citations.
- `ONE_PAGE_CONCEPT_SUMMARY.pdf` as an additional safety deliverable from the longer challenge brief.
- `SETUP.md` for the current static/local component.
- `REPRODUCIBILITY.md`.
- `REFERENCES.md` containing more than the required three recent primary papers (2022-2026).
- `SOURCES_AND_LICENSES.md`.
- `AI_ASSISTANCE_DISCLOSURE.md`.
- `PUBLIC_LINKS.md`.
- `.gitignore` suitable for a public source repository.

## Must still be completed by the team

### 1. Create the public source-code repository

The challenge wording requires a **public source-code repository**. GitHub is the simplest option, but not the only possible Git host. Add its URL to `README.md` and `PUBLIC_LINKS.md`.

### 2. Deploy a public artifact URL

Deploy the artifact so it opens without sign-in. Add that URL to `README.md` and `PUBLIC_LINKS.md`.

### 3. Restore missing lesson HTML entry pages - CRITICAL

The uploaded source currently contains only the root `index.html`, while navigation targets include:

- `bdh-cq/index.html`
- `inference-strategy/index.html`
- `adaptation/index.html`
- `cot-vs-test-time/index.html`

The lesson CSS/JS/assets are present, but those entry documents are absent. Restore the working versions before deployment and test every route.

### 4. Resolve asset and font licensing - CRITICAL

See `SOURCES_AND_LICENSES.md`. In particular:

- Montelgo and Casko demo fonts carry restrictive bundled terms.
- Street Robot's supplied license text needs clarification.
- several images/GLBs have unknown exact provenance;
- paper-derived figures need source/figure/license records.

### 5. Choose an outbound project-code license

No license for team-authored code was provided. Pick one if appropriate and add a `LICENSE` file.

### 6. Confirm team details / final naming

Add team name, member names (if required by portal), final repository URL, and final artifact URL.

### 7. Final signed-out test

From a private/signed-out browser:

- load the artifact URL;
- visit every lesson;
- use every major interaction;
- verify no external login is required;
- verify fonts/images/GLBs load;
- verify citations and source labels are visible beside technical claims;
- verify mobile layout if the judges may use mobile.
