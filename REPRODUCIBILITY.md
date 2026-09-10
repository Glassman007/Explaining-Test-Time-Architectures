# Reproducibility

## Reproducing the Web Artifact

1. Clone or download the repository.
2. Follow the instructions in `SETUP.md`.
3. Serve the repository over HTTP.
4. Open the root page in a modern browser.
5. Exercise the interactive controls, lesson modules, and navigation.

## Deterministic and Local Components

- Tree and maze interactions, planning, constraint exercises, sampling and voting interactions, and mastery behaviors implemented in JavaScript run locally in the browser.
- The root Three.js scene uses local GLB assets and bundled Three.js modules.
- `tools/build_web.py` deterministically rebuilds `assets/interconnected-web.glb` using a fixed random seed.

## Published Research and Local Simulation

The repository uses published research to explain test-time architecture, inference strategy, and adaptation concepts. Citations identify the source of technical claims; they do not imply that the project independently reproduced every experiment from the cited papers.

- BDH and BDH-CQ technical claims are presented as results reported by the respective papers [R7, R8].
- Illustrative state animations are educational simplifications and are not presented as literal inspection of proprietary hidden states.
- Research figure screenshots or derivatives are supporting educational visuals rather than live model outputs.
- Numerical benchmarks taken from papers retain their associated benchmark, model or configuration, metric, and evidence context where shown.

## Research References

See `REFERENCES.md` for [R1]-[R15].
