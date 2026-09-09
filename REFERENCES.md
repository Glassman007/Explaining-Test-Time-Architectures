# Research References

**Selected concept:** Test-Time Adaptation

## Recent primary papers directly supporting the selected concept (2022-2026)

### [R1] Efficient Test-Time Model Adaptation without Forgetting (EATA)
- **Authors/year:** Niu et al. (2022)
- **Primary source:** https://arxiv.org/abs/2204.02610
- **Why it matters here:** Primary TTA paper; selective entropy-based adaptation and anti-forgetting regularization.

### [R2] Test-Time Adaptation via Self-Training with Nearest Neighbor Information (TAST)
- **Authors/year:** Jang, Chung & Chung (2022)
- **Primary source:** https://arxiv.org/abs/2207.10792
- **Why it matters here:** Primary TTA paper; nearest-neighbor-informed pseudo-labels and trainable adaptation modules.

### [R3] Test-Time Prompt Tuning for Zero-Shot Generalization in Vision-Language Models (TPT)
- **Authors/year:** Shu et al. (2022)
- **Primary source:** https://arxiv.org/abs/2209.07511
- **Why it matters here:** Primary TTA paper; adapts prompts on the fly from a test sample.

### [R4] Towards Stable Test-Time Adaptation in Dynamic Wild World (SAR)
- **Authors/year:** Niu et al. (2023)
- **Primary source:** https://arxiv.org/abs/2302.12400
- **Why it matters here:** Primary TTA paper; studies instability/collapse and proposes sharpness-aware reliable entropy minimization.

### [R5] Entropy is not Enough for Test-Time Adaptation: From the Perspective of Disentangled Factors (DeYO)
- **Authors/year:** Lee et al. (2024)
- **Primary source:** https://arxiv.org/abs/2403.07366
- **Why it matters here:** Primary TTA paper; shows failure modes of entropy-only confidence and proposes PLPD-based selection/weighting.

## BDH / BDH-CQ primary sources

### [R7] The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain
- **Authors/year:** Kosowski et al. (2025)
- **Primary source:** https://arxiv.org/abs/2509.26507
- **Evidence note:** Primary BDH architecture paper. Claims in the artifact should be attributed to the paper rather than treated as independent verification.

### [R8] BDH-CQ: In-Context Learning with Recurrent Latent Reasoning
- **Authors/year:** Engdahl et al. (2026)
- **Primary source:** https://arxiv.org/abs/2608.09888
- **Evidence note:** Primary BDH-CQ report; inference-time inputs update recurrent memory and query solving uses iterative latent computation.

## Secondary taxonomy source

### [R6] Beyond Model Adaptation at Test Time: A Survey
- **Authors/year:** Xiao & Snoek (2024)
- **Source:** https://arxiv.org/abs/2411.03687
- **Use:** Secondary survey; organizes TTA by what is adapted: model, inference, normalization, sample, or prompt.

## Supporting papers used by the architecture / inference-strategy modules

- **[R9] Tree of Thoughts: Deliberate Problem Solving with Large Language Models** - Yao et al. (2023). https://arxiv.org/abs/2305.10601  
  Supporting inference-strategy paper; explores multiple reasoning paths with evaluation, lookahead, and backtracking.
- **[R10] Self-Consistency Improves Chain of Thought Reasoning in Language Models** - Wang et al. (2022/2023). https://arxiv.org/abs/2203.11171  
  Supporting inference-strategy paper; samples diverse reasoning paths and aggregates answers.
- **[R11] Large Language Monkeys: Scaling Inference Compute with Repeated Sampling** - Brown et al. (2024). https://arxiv.org/abs/2407.21787  
  Supporting test-time-compute paper; repeated sampling as an inference-scaling axis.
- **[R12] Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters** - Snell et al. (2024). https://arxiv.org/abs/2408.03314  
  Supporting test-time-compute paper; search/verifier and adaptive allocation of test-time compute.
- **[R13] Training Large Language Models to Reason in a Continuous Latent Space (Coconut)** - Hao et al. (2024/2026). https://arxiv.org/abs/2412.06769  
  Supporting latent-reasoning paper; feeds hidden reasoning state back in continuous space rather than decoding every intermediate step.
- **[R14] Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach** - Geiping et al. (2025). https://arxiv.org/abs/2502.05171  
  Supporting latent-reasoning paper; recurrent block can be unrolled to greater depth at test time.
- **[R15] Hierarchical Reasoning Model** - Wang et al. (2025). https://arxiv.org/abs/2506.21734  
  Supporting architecture paper; two interdependent recurrent modules at different timescales.

## Citation discipline

Technical statements in the README and blog use `[R#]` identifiers immediately beside the claims they support. The interactive artifact should follow the same rule when its missing HTML lesson pages are restored. Do not cite the 2024 survey [R6] as if it were a primary experimental result. Do not present developer-reported BDH/BDH-CQ results [R7-R8] as independent reproduction unless this repository actually reproduces them.
