# Test-Time Architectures

**DataForge 2026 - Pathway Track submission package**  
**Selected concept:** Test-Time Adaptation  
**Artifact type:** Static interactive web learning artifact with architecture, inference-strategy, and adaptation modules.

## Project Focus

> At test time, a system can change different parts of its computation - such as model parameters, normalization behavior, prompts, inputs, or temporary state - and those choices create different adaptation costs, stability risks, and memory behavior. The project separates adaptation from the separate question of how additional inference compute is spent.

The artifact distinguishes three related questions:

1. **Architecture - "What does the thinking?"** The internal computational organization of the model.
2. **Inference strategy - "How is compute spent?"** Search, parallel sampling, token-space reasoning, latent/recurrent computation, and related ways of allocating inference compute. Tree of Thoughts explicitly explores multiple reasoning paths with evaluation and backtracking [R9], while self-consistency samples diverse chains and aggregates answers [R10].
3. **Adaptation - "What can change?"** Which part of the system is modified in response to test-time data or a new task. Modern TTA work includes model-parameter adaptation [R1], adaptation modules and pseudo-labeling [R2], prompt adaptation [R3], and methods designed to improve stability under difficult streams [R4, R5]. The broader survey literature organizes methods by adapting the model, inference, normalization, sample, or prompt [R6].

The site uses BDH/BDH-CQ as a research case study. BDH-CQ is described by its authors as updating recurrent memory from inference-time inputs and then solving queries through iterative latent computation [R8]. The educational simulations are presented as teaching representations of these ideas rather than official BDH-CQ executions.

## Intended Learner

The artifact is designed for an undergraduate CS/ML student, software engineer, or data scientist who understands basic neural-network inference but may not yet know the distinction between architecture, inference-time compute, and test-time adaptation.

## Prerequisites

- Basic understanding of trained models and model parameters or weights.
- Familiarity with inference versus training.
- Transformer attention, gradient descent, and probability distributions are helpful but not required.

## Learning Objectives

After using the artifact, a learner should be able to:

- distinguish **trained parameters** from **temporary inference-time state**;
- explain why test-time adaptation does not always mean full-model retraining;
- identify several adaptation surfaces, including parameters, normalization behavior, prompts, samples, and temporary state [R1-R6];
- distinguish **adaptation** from **test-time compute scaling**;
- explain how search and sampling allocate inference compute differently [R9-R12];
- recognize latent/recurrent computation as a different place to spend inference compute [R13-R15];
- explain the BDH-CQ case study at the evidence level supported by its technical report [R8];
- identify a key TTA failure mode: unstable or noisy updates can reduce performance, motivating sample selection, regularization, and more robust objectives [R1, R4, R5].

## Project Architecture

The project is a static client-side web artifact organized into the following components:

- `index.html` - opening interactive story and navigation shell.
- `style.css`, `inference-story.css`, `scroll.js`, `navigation.js` - story layout, navigation, and scroll-driven transitions.
- `web-background.js`, `inference-artifact.js` - Three.js/WebGL presentation of the opening scene and rotating particle artifacts.
- `bdh-cq/` - BDH-CQ and architecture-learning modules.
- `inference-strategy/`, `tree-graph/`, `graph-search/`, `parallel-sampling/` - inference-time compute, search, and sampling learning components.
- `adaptation/` - test-time adaptation content, styling, and research visuals.
- `cot-vs-test-time/` - Chain-of-Thought comparison content and styling.
- `assets/` - GLB models, images, and local fonts.
- `vendor/` - bundled Three.js runtime components.

## Computation and Evidence

- **Live browser computation:** DOM interactions, maze and search logic, sampling and voting logic, mastery logic, Three.js particle and background behavior, and other JavaScript interactions included in the source.
- **Illustrative visualizations:** Interface animations communicate conceptual state and computation without claiming literal access to proprietary or hidden model states.
- **Research-derived visuals:** PNG and JPG figures in lesson asset folders support the educational explanations. Their provenance status is recorded in `SOURCES_AND_LICENSES.md`.
- **Published BDH/BDH-CQ evidence:** Technical claims are based on the primary papers [R7, R8]. The site distinguishes published research claims from local educational simulation.

## Quick Setup

No notebook, Python backend, or model server is required.

```bash
cd <repository-root>
python -m http.server 8000
```

Open `http://localhost:8000/`.

The project is served over HTTP rather than opened with `file://` because JavaScript modules and GLB assets rely on browser module and asset-loading behavior. Full instructions are provided in `SETUP.md`.

## Reproducibility

Browser interactions are deterministic or locally computed unless otherwise noted. `tools/build_web.py` regenerates `assets/interconnected-web.glb` using Python standard-library code with a fixed random seed. `REPRODUCIBILITY.md` documents the reproduction steps and the distinction between local educational computation and research-reported evidence.

## Research References

Technical claims use the identifiers in `REFERENCES.md`. The reference set includes recent primary work on test-time adaptation [R1-R5], the BDH and BDH-CQ papers [R7-R8], and supporting research on search, sampling, and latent test-time compute [R9-R15].

## Sources and Licenses

`SOURCES_AND_LICENSES.md` records the provenance and license information available for code, fonts, 3D assets, raster graphics, and research-derived visuals included in the submission.

## AI Assistance Disclosure

AI-assisted development is documented in `AI_ASSISTANCE_DISCLOSURE.md`.

## Submission Files

- `BLOG.pdf` - technical blog.
- `ONE_PAGE_CONCEPT_SUMMARY.pdf` - one-page concept summary.
- `SETUP.md` - local setup instructions.
- `REPRODUCIBILITY.md` - reproducibility and evidence notes.
- `REFERENCES.md` - primary sources and supporting research.
- `SOURCES_AND_LICENSES.md` - code, data, graphics, fonts, components, and asset provenance record.
- `AI_ASSISTANCE_DISCLOSURE.md` - AI assistance disclosure.

## Repository License

No outbound license for the original project source code is included in the submitted repository. Repository access does not grant reuse rights beyond any licenses explicitly provided.
