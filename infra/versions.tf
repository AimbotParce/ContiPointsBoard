terraform {
  required_version = ">= 1.5"

  # State is stored in-cluster via the kubernetes backend: a Secret (plus a
  # Lease for locking) in this app's own namespace. The CI runner pod runs as
  # the in-cluster ci-deploy ServiceAccount (granted RBAC on secrets + leases by
  # HomeInfra), so no cloud credentials are needed and state is isolated per app
  # by namespace.
  #
  # Local (out-of-cluster) runs override at init, e.g.:
  #   terraform init -backend-config="in_cluster_config=false" \
  #                  -backend-config="config_path=$HOME/.kube/config"
  backend "kubernetes" {
    secret_suffix     = "state"
    namespace         = "conti-points-board"
    in_cluster_config = true
  }

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.35"
    }
  }
}

# When kubeconfig_path is null (the default), the provider uses in-cluster
# configuration -- the mounted ci-deploy ServiceAccount token of the CI runner
# pod that Terraform runs in. Set kubeconfig_path in a local terraform.tfvars
# only for out-of-cluster runs (e.g. from a laptop).
provider "kubernetes" {
  config_path = var.kubeconfig_path
}
