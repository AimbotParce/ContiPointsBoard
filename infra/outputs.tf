output "namespace" {
  description = "Kubernetes namespace where ContiPointsBoard is deployed"
  value       = var.namespace
}

output "service_name" {
  description = "Name of the Kubernetes Service"
  value       = kubernetes_service_v1.app.metadata[0].name
}

output "tailscale_url" {
  description = "URL to access the app on the Tailscale network (tailnet name must be appended)"
  value       = "https://${var.tailscale_hostname}.<your-tailnet>.ts.net"
}
