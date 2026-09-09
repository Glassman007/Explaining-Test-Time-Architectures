# Reproducibility and Evidence Boundaries

## Reproducing the web artifact

1. Clone/download the repository.
2. Follow `SETUP.md`.
3. Open the root page over HTTP.
4. Exercise the interactive controls and navigation.

## Deterministic / local components

- Tree/maze, planning, constraint, sampling/voting, and mastery behaviors contained in JavaScript are local educational computations.
- The root Three.js scene uses local GLB assets and bundled Three.js modules.
- `tools/build_web.py` deterministically rebuilds `assets/interconnected-web.glb` with a fixed random seed.

## Published evidence versus local simulation

The repository uses published research to explain concepts. A citation in the artifact or blog does **not** mean that the project independently reproduced the authors' full experiment.

In particular:

- BDH and BDH-CQ claims must be labeled as **reported by the respective papers** [R7, R8].
- Illustrative state animations are teaching simplifications and must not be described as literal inspection of proprietary hidden states.
- Research figure screenshots/derivatives are not live model outputs.
- Any numerical benchmark shown from a paper should retain the benchmark name, model/configuration, metric, and evidence label (reported vs reproduced).

## Research references

See `REFERENCES.md` for [R1]-[R15].

## Current limitation

A complete end-to-end reproduction of the intended multi-page experience cannot be verified from this upload because the lesson `index.html` entry pages referenced from the root navigation are absent. Restore those files before final deployment.
