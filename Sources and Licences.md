# Sources and License Record

This document records the code, data, model weights, graphics, fonts, 3D assets, and reused components included in the DataForge submission. The record reflects the provenance and licensing information available within the submitted project files.

## Project Code

- HTML, CSS, JavaScript, Python utility code, and educational interaction logic not identified as third-party below are part of the project source and were developed with AI assistance.
- No outbound license for the original project source code is included in the submitted repository.

## Third-Party Code

| Component | Location | Source / License Status |
|---|---|---|
| three.js core | `vendor/three.core.min.js`, `vendor/three.module.min.js` | MIT. The bundled notice is stored in `vendor/THREE-LICENSE.txt`. |
| GLTFLoader / BufferGeometryUtils | `vendor/loaders/GLTFLoader.js`, `vendor/utils/BufferGeometryUtils.js` | Part of the three.js ecosystem and used under the three.js MIT license with the bundled notice preserved. |
| Manrope web font | Imported from Google Fonts in several CSS files | Manrope is distributed through Google Fonts. The font is fetched externally rather than bundled in the repository. |

## Bundled Fonts

| File | Bundled Terms | Status in Submission |
|---|---|---|
| `assets/fonts/CaskoLuxuryDemo-Regular.otf` | `Font-Readme.pdf` states personal-use terms and restricts commercial use without a purchased license. | Included with its accompanying terms. |

## 3D Assets

| Asset | Embedded Metadata / Known Origin | Status |
|---|---|---|
| `assets/interconnected-web.glb` | Generator metadata: `Dataforge interconnected web`; reproducible with `tools/build_web.py`. | Project-generated, AI-assisted asset. |
| `assets/interconnected-star.glb` | Generator metadata: `Dataforge freely suspended particles and faint hex cage`. | Project-generated, AI-assisted asset. |


## Raster Graphics and Photos

The following image assets are included in the project, but the repository does not contain authoritative creator or license metadata for them:

- `assets/fire.jpg`
- `assets/gondor-tree.jpg`
- `assets/neural-pathways.jpg`
- `tree-graph/assets/mini-maze.jpg`
- `tree-graph/assets/planning.jfif`
- `tree-graph/assets/constraint.jfif`

These files are documented according to the ownership and reuse information available in the project records.

## Research Figures and Screenshots

The project contains research-related visual assets under:

- `inference-strategy/assets/*.png`
- `adaptation/assets/*.png`

These visuals support explanations of search, sampling, and test-time adaptation concepts. The repository file names indicate their subject matter, but the project metadata does not establish complete source and reuse information for every image. Research citations for the underlying technical material are maintained separately in `REFERENCES.md`.

## Data and Model Weights

- No external dataset files are included in the submission.
- No neural model weight or checkpoint files are included.
- GLB files in the repository are geometry assets and are not model weights.
- The submitted version does not depend on an external hosted model API for its documented local setup.

## Research Sources

Research citations are listed in `REFERENCES.md`. Citations identify the technical sources used in the educational material and do not by themselves grant permission to redistribute paper figures or PDFs.

## Provenance Record

For each non-project asset, this record includes the available file name, creator or generator information, source, license or supplied terms, and its role in the project.
