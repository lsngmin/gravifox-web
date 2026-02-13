# Gravifox AI Training & Inference Pipeline Status

## 1. Repository Layout
- The requested `tvb-ai/` workspace (containing `core/`, `scripts/`, etc.) is not present in the current checkout, so the training code, dataset builders, and optimizer modules cannot be inspected directly.  (See command trace below in this document for reproducibility.)
- Because the source tree is missing, only the web frontend and the bundled FastAPI OpenAPI schema are available locally.

## 2. FastAPI Surface (from `public/swagger.json`)
- `/api/v1/images/{uuid}/analyze` – sends an uploaded image to the AI service and returns the prediction payload.
- `/api/v1/images/send_data` – uploads an image for later analysis via UUID hand-off.
- `/api/v1/files/upload` – generic file uploader, likely returning UUID references consumed by the analyzer.
- `/api/v1/register`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/refresh`, `/api/v1/auth/me` – identity endpoints supporting the dashboard.
- `/api/v1/profile/` and `/api/v1/issue/` – profile and issue tracker integration hooks for the console.
- `/health` – service liveness probe.

### Current Runtime Flow (observable portion)
```text
[Browser Upload]
     |
     v
/api/v1/files/upload  -->  UUID ticket
     |
     v
/api/v1/images/send_data (stores payload for inference)
     |
     v
/api/v1/images/{uuid}/analyze  -->  { predicted_class, predicted_probability, prediction_time }
```

## 3. Missing Training Stack
- Expected folders (based on the product brief):
  ```
  tvb-ai/
    core/
      configs/
      datasets/
      models/
      trainer/
      utils/
    scripts/
      train.py
      launch_vit_residual_matrix.py
  ```
- None of these assets ship with this repository snapshot. Without them we cannot enumerate supported backbones, residual/multi-patch logic, dataset transforms, or optimizer policies.

## 4. Known Gaps & Next Actions
- Pull the missing `tvb-ai/` module (likely a submodule or private repository) to unlock the training and inference internals.
- Once the sources are available, document:
  - Backbone registry and configuration schema.
  - Dataset/augmentation contracts for image vs. video inputs.
  - Training orchestration (`train.py`, `optim.py`, schedulers, logging).
  - Experiment launch scripts (`launch_vit_residual_matrix.py`) and YAML-driven sweeps.
- Re-run this documentation effort after syncing the AI workspace to produce the full pipeline overview.

---

### Command trace (absence verification)
```
find . -maxdepth 4 -type d -name 'tvb-ai'
```
