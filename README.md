# Test-Time Architectures

**DataForge 2026 - Pathway Track submission package**  
**Selected concept:** Test-Time Adaptation  
**Artifact status:** static web learning artifact, with supporting architecture and inference-strategy modules.

## Required public links

- **Public artifact URL (must open without sign-in):** `TODO: ADD DEPLOYED URL`
- **Public source-code repository:** `TODO: ADD PUBLIC REPOSITORY URL`

These two URLs cannot be created by the ZIP itself. Create them before submission and replace the two TODO values above and in `PUBLIC_LINKS.md`.

## Central claim

> At test time, a system can change different parts of its computation - such as model parameters, normalization behavior, prompts, inputs, or temporary state - and those choices create different adaptation costs, stability risks, and memory behavior; adaptation must therefore be distinguished from simply spending more inference compute.

The artifact deliberately separates three questions that are often conflated:

1. **Architecture - "What does the thinking?"** The internal computational organization of the model.
2. **Inference strategy - "How is compute spent?"** Search, parallel sampling, token-space reasoning, latent/recurrent computation, and related ways of allocating inference compute. Tree of Thoughts explicitly explores multiple reasoning paths with evaluation and backtracking [R9], while self-consistency samples diverse chains and aggregates answers [R10].
3. **Adaptation - "What can change?"** Which part of the system is modified in response to test-time data or a new task. Modern TTA work includes model-parameter adaptation [R1], adaptation modules and pseudo-labeling [R2], prompt adaptation [R3], and methods designed to improve stability under difficult streams [R4, R5]. The broader survey literature organizes methods by adapting the model, inference, normalization, sample, or prompt [R6].

The site also uses BDH/BDH-CQ as a required case study. BDH-CQ is described by its authors as updating recurrent memory from inference-time inputs and then solving queries through iterative latent computation [R8]. This is presented as a **published research case study**, not as a claim that the educational simulations are official BDH-CQ executions.

## Intended learner

An undergraduate CS/ML student, software engineer, or data scientist who understands basic neural-network inference but may not yet know the distinction between architecture, inference-time compute, and test-time adaptation.

## Prerequisites

- Basic idea of a trained model and model parameters/weights.
- Familiarity with inference versus training.
- Helpful but not mandatory: Transformer attention, gradient descent, and probability distributions.

## Learning objectives

After using the artifact, a learner should be able to:

- distinguish **trained parameters** from **temporary inference-time state**;
- explain why test-time adaptation does not always mean full-model retraining;
- identify several possible adaptation surfaces, including parameters, normalization behavior, prompts, samples, and temporary state [R1-R6];
- distinguish **adaptation** from **test-time compute scaling**;
- explain how search and sampling allocate inference compute differently [R9-R12];
- recognize latent/recurrent computation as a different place to spend inference compute [R13-R15];
- explain the BDH-CQ case study at the evidence level actually supported by its technical report [R8];
- identify at least one failure mode: unstable/noisy updates can harm TTA, motivating sample selection, regularization, or more robust objectives [R1, R4, R5].

## Artifact architecture

The current project is a static client-side web artifact:

- `index.html` - opening interactive story / navigation shell.
- `style.css`, `inference-story.css`, `scroll.js`, `navigation.js` - story layout, navigation, and scroll-driven transitions.
- `web-background.js`, `inference-artifact.js` - Three.js/WebGL presentation of the opening scene and rotating particle artifacts.
- `bdh-cq/` - BDH-CQ / architecture-learning source files.
- `inference-strategy/`, `tree-graph/`, `graph-search/`, `parallel-sampling/` - inference-time compute / search / sampling learning components.
- `adaptation/` - test-time adaptation styling and research visual assets.
- `cot-vs-test-time/` - Chain-of-Thought comparison source styling.
- `assets/` - GLB models, images, and local fonts.
- `vendor/` - bundled Three.js runtime components.

### Important current-source limitation

The uploaded source contains only the root `index.html`. The root navigation references `bdh-cq/index.html`, `inference-strategy/index.html`, `adaptation/index.html`, and `cot-vs-test-time/index.html`, but those HTML entry documents are not present in this archive. Their CSS/JS/assets are present. **Restore those entry pages from the working project before publishing the final public artifact.** A public URL that contains broken lesson links will not satisfy the intended learning journey.

## What is live, precomputed, illustrative, or external evidence?

- **Live browser computation:** DOM interactions, maze/search logic, sampling/voting logic, mastery logic, Three.js particle/background behavior, and other JavaScript interactions included in the source.
- **Illustrative visualizations:** UI animations that communicate conceptual state or computation. They must not be described as literal observation of proprietary/internal BDH hidden states.
- **Research-derived/precomputed visuals:** PNG/JPG figures in the lesson asset folders. Their exact provenance and reuse permission must be confirmed in `SOURCES_AND_LICENSES.md` before public submission.
- **Published BDH/BDH-CQ evidence:** claims taken from the primary papers [R7, R8]. These are not independently reproduced by this repository unless an explicit reproduction script/result is present.

## Quick setup

No notebook, Python backend, or model server is required for the current uploaded source.

```bash
cd <repository-root>
python -m http.server 8000
```

Open `http://localhost:8000/`.

Do not open `index.html` using `file://`; JavaScript modules and GLB assets should be served over HTTP. More detail is in `SETUP.md`.

## Reproduction

The browser interactions are deterministic or locally computed unless otherwise noted. `tools/build_web.py` regenerates `assets/interconnected-web.glb` using Python standard-library code. See `REPRODUCIBILITY.md` for exact steps and evidence boundaries.

## Research references

Technical claims above use the identifiers in `REFERENCES.md`. At least five recent primary TTA papers from 2022-2024 are included [R1-R5], plus the 2025 BDH paper and 2026 BDH-CQ report [R7-R8]. Supporting research for search, sampling, and latent test-time compute is also listed [R9-R15].

## Provenance and licenses

Read `SOURCES_AND_LICENSES.md` before public deployment. **The current archive contains fonts whose bundled terms restrict usage, and multiple visual/3D assets whose exact source or redistribution permission is not encoded in the project.** Do not treat a public repository as automatic permission to redistribute those assets.

## AI assistance disclosure

See `AI_ASSISTANCE_DISCLOSURE.md`.

## Submission files

- `BLOG.pdf` - technical blog PDF.
- `ONE_PAGE_CONCEPT_SUMMARY.pdf` - additional one-page summary included because the longer DataForge brief separately describes this deliverable.
- `SETUP.md` - local setup instructions.
- `REPRODUCIBILITY.md` - reproduction and evidence-boundary notes.
- `REFERENCES.md` - primary sources and supporting research.
- `SOURCES_AND_LICENSES.md` - code/data/weights/graphics/fonts/components record.
- `AI_ASSISTANCE_DISCLOSURE.md` - AI/code/data/asset/license disclosure.
- `PUBLIC_LINKS.md` - final URL fields and deployment checklist.
- `SUBMISSION_READINESS.md` - remaining actions before final upload.

## Repository license

No outbound license for the team's original source code was supplied in the uploaded project. Public visibility does **not** by itself grant reuse rights. The team should choose and add an explicit repository license (for example MIT or Apache-2.0 if appropriate) before submission; this package does not make that legal choice on the team's behalf.
