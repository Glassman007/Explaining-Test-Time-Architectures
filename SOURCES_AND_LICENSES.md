# Sources and License Record

This file records code, data, model weights, graphics, fonts, and reused components found in the uploaded project. **Unknown provenance is recorded as unknown rather than guessed.** Resolve every `ACTION REQUIRED` item before public release.

## Team-authored / project code

- HTML, CSS, JavaScript, Python utility code, and educational interaction logic not listed as third-party below: **project/team source, AI-assisted during development**.
- **Outbound repository license:** `ACTION REQUIRED - no project license was supplied.` Public visibility does not automatically grant reuse rights. Choose an explicit license if the organizers expect one.

## Third-party code

| Component | Location | Source/license status |
|---|---|---|
| three.js core | `vendor/three.core.min.js`, `vendor/three.module.min.js` | MIT. Bundled notice in `vendor/THREE-LICENSE.txt`. |
| GLTFLoader / BufferGeometryUtils | `vendor/loaders/GLTFLoader.js`, `vendor/utils/BufferGeometryUtils.js` | Part of three.js ecosystem; treat under the three.js MIT license and preserve notices. |
| Manrope web font | imported from Google Fonts in several CSS files | Manrope is distributed through Google Fonts; verify and preserve the applicable OFL license/attribution in the final repository. The font is fetched externally rather than bundled here. |

## Bundled fonts - licensing risk

| File | Bundled terms | Submission action |
|---|---|---|
| `assets/fonts/Montelgo-Regular.otf` | `Montelgo-Readme.txt` says **personal use only / non-profit**, commercial use prohibited without purchase. | **ACTION REQUIRED:** confirm the hackathon/public-web use is permitted or replace/obtain license before public deployment. |
| `assets/fonts/CaskoLuxuryDemo-Regular.otf` | `Font-Readme.pdf` says **personal use only / no commercial use** without a purchased license. | **ACTION REQUIRED:** obtain permission/license or replace before public deployment. |
| `assets/fonts/Street-Robot-Inline.ttf` | supplied `Street-Robot-License.txt` contains conflicting wording: it mentions CC attribution/share-alike while also imposing noncommercial/commercial-license conditions. | **ACTION REQUIRED:** do not assume standard CC permission; clarify with the rightsholder or replace. |

**Do not redistribute font files outside the submission/repository unless their license permits it.**

## 3D assets

| Asset | Embedded metadata / known origin | License status |
|---|---|---|
| `assets/interconnected-web.glb` | Generator metadata: `Dataforge interconnected web`; reproducible with `tools/build_web.py`. | Project/AI-assisted generated asset; team should select the outbound project license. |
| `assets/interconnected-star.glb` | Generator metadata: `Dataforge freely suspended particles and faint hex cage`. | Project/AI-assisted generated asset; team should document generation and outbound license. |
| `assets/neural-pathways.glb` | GLB generator metadata references `trimesh`; this identifies tooling, not source ownership. | **ACTION REQUIRED:** confirm original mesh/source and license. |
| `assets/drop-of-water.glb` | GLB generator metadata references `Sketchfab-12.67.0`. | **ACTION REQUIRED:** locate exact Sketchfab model page/creator/license. Do not redistribute on the basis of generator metadata alone. |

## Raster graphics / photos

The following assets have no authoritative source/license metadata encoded in the uploaded project and must be resolved from the team's asset history before public submission:

- `assets/fire.jpg`
- `assets/gondor-tree.jpg`
- `assets/neural-pathways.jpg`
- `tree-graph/assets/mini-maze.jpg`
- `tree-graph/assets/planning.jfif`
- `tree-graph/assets/constraint.jfif`

**ACTION REQUIRED:** add original creator/source URL and exact license, or replace with team-created / properly licensed assets.

## Research-derived figures / screenshots

The project contains research-visual assets under `inference-strategy/assets/` and `adaptation/assets/`. File names strongly indicate educational figures related to search/sampling/test-time-adaptation papers, but the archive does not contain enough provenance metadata to prove the exact source and reuse terms for every image. They include:

- `inference-strategy/assets/*.png`
- `adaptation/assets/*.png`

**ACTION REQUIRED:** for each figure, record paper title, figure number (if applicable), source URL, whether it is a screenshot/redraw/custom diagram, and the paper/figure reuse license. If reuse permission is unclear, redraw the figure yourself from the underlying facts rather than redistributing the original artwork.

## Data and model weights

- No external dataset files were detected in this uploaded ZIP.
- No neural model weight/checkpoint files were detected.
- The GLB assets are geometry/assets, not model weights.
- If a hosted deployment later calls an API or model service, add the provider/model/terms here.

## Research sources

Research citations are listed separately in `REFERENCES.md`. Citation is not the same as permission to redistribute figures or paper PDFs.

## Recommended final provenance table

Before submission, every non-team asset should have: **file -> creator -> source URL -> exact license/permission -> modifications -> attribution text**.
