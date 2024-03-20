terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.18"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }

    auth0 = {
      source  = "auth0/auth0"
      version = "~> 0.50"
    }
  }

  required_version = ">= v1.7.4"
}
