# --- Locals ---

locals {
  images = yamldecode(file("${path.module}/${var.image_versions_file}"))
}

# The namespace, ci-deploy RBAC, and the conti-points-board-runner are
# provisioned by HomeInfra (environments/k8s apps.tf). This module deploys only
# the workload into that namespace -- it does NOT create the namespace.
#
# ContiPointsBoard is a stateless Next.js app (game state lives in the browser's
# localStorage), so there is no database, PVC, or secret -- just the web
# Deployment, its Service, and a Tailscale Ingress.

# --- Deployment ---

resource "kubernetes_deployment_v1" "app" {
  # Don't block apply on rollout: the image is published by the separate build
  # pipeline, so terraform provisions desired state and the Deployment
  # reconciles when the image is available.
  wait_for_rollout = false

  metadata {
    name      = "conti-points-board"
    namespace = var.namespace
    labels    = { app = "conti-points-board" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "conti-points-board" }
    }

    template {
      metadata {
        labels = { app = "conti-points-board" }
      }

      spec {
        container {
          name  = "app"
          image = local.images.image

          port {
            container_port = 3000
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 3000
            }
            initial_delay_seconds = 10
            period_seconds        = 10
          }
        }
      }
    }
  }
}

# --- Service ---

resource "kubernetes_service_v1" "app" {
  metadata {
    name      = "conti-points-board"
    namespace = var.namespace
  }

  spec {
    selector = { app = "conti-points-board" }

    port {
      port        = 80
      target_port = 3000
    }
  }
}

# --- Ingress (Tailscale) ---

resource "kubernetes_ingress_v1" "app" {
  metadata {
    name      = "conti-points-board"
    namespace = var.namespace
  }

  spec {
    ingress_class_name = "tailscale"

    # Host-agnostic backend; the Tailscale operator takes the MagicDNS name and
    # TLS cert from tls.hosts[0].
    default_backend {
      service {
        name = kubernetes_service_v1.app.metadata[0].name
        port {
          number = 80
        }
      }
    }

    tls {
      hosts = [var.tailscale_hostname]
    }
  }
}
