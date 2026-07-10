# ContiPointsBoard — Kubernetes Infrastructure

Terraform module that deploys ContiPointsBoard to the HomeInfra k3s cluster with
Tailscale-only access. It's a **stateless** Next.js app (game state lives in the
browser's localStorage), so there is no database, PVC, or secret — just the web
Deployment, its Service, and a Tailscale Ingress.

## How it fits into HomeInfra

The platform (namespace, `ci-deploy` RBAC, `conti-points-board-runner`) is owned
by [HomeInfra](https://github.com/AimbotParce/HomeInfra) `environments/k8s`
`apps.tf`. Terraform runs on the in-cluster runner as `ci-deploy`, so the
provider and the `kubernetes` state backend authenticate via in-cluster config —
no kubeconfig or cloud credentials in CI. See HomeInfra
[`docs/deploying-k8s-app/`](https://github.com/AimbotParce/HomeInfra/tree/main/docs/deploying-k8s-app).

## CI/CD

- **Build and push** (`.github/workflows/build-and-push.yml`) — on push to
  `main` (app code), builds+pushes the image to GHCR and opens a PR bumping
  `image-versions.yaml`. Also runnable manually (`workflow_dispatch`) to seed the
  first image.
- **Terraform Plan** (`terraform-plan.yml`) — plan on PRs touching `infra/`.
- **Terraform Apply** (`terraform-apply.yml`) — apply on merge to `main`.

`app` sets `wait_for_rollout = false` so apply doesn't block if the image isn't
published yet — it reconciles once the image lands.

## First-time bootstrap

1. Merge the HomeInfra PR and apply the `k8s` env (creates the namespace +
   `conti-points-board-runner`).
2. Run **Build and push** once (push app code or trigger it manually) so the
   image exists in GHCR.
3. Merge the infra PR (and the image-bump PR) → apply deploys it at
   `https://conti.<your-tailnet>.ts.net`.

## Local usage (out-of-cluster)

```bash
cd infra/
terraform init \
  -backend-config="in_cluster_config=false" \
  -backend-config="config_path=$HOME/.kube/config"
terraform plan
terraform apply
```

## Variables

| Variable | Description | Default |
|---|---|---|
| `kubeconfig_path` | kubeconfig for out-of-cluster runs; null → in-cluster | `null` |
| `namespace` | Namespace (created by HomeInfra) | `conti-points-board` |
| `tailscale_hostname` | Hostname on the tailnet | `conti` |
| `image_versions_file` | YAML file holding the pinned image | `image-versions.yaml` |
