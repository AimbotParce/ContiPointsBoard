variable "kubeconfig_path" {
  description = "Path to a kubeconfig file for out-of-cluster runs. Leave null (default) to use in-cluster auth via the runner's ci-deploy ServiceAccount."
  type        = string
  default     = null
  sensitive   = true
}

variable "namespace" {
  description = "Kubernetes namespace to deploy into (provisioned by HomeInfra; this module deploys into it but does not create it)"
  type        = string
  default     = "conti-points-board"
}

variable "image_versions_file" {
  description = "Path to the YAML file with the pinned image (relative to the module root)"
  type        = string
  default     = "image-versions.yaml"
}

variable "tailscale_hostname" {
  description = "Hostname for the app on the Tailscale network (app will be at https://<hostname>.<tailnet>.ts.net)"
  type        = string
  default     = "conti"
}
