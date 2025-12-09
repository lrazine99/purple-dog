# DigitalOcean API Token
variable "do_token" {
  description = "DigitalOcean API Token"
  type        = string
  sensitive   = true
}

# SSH Key Path
variable "ssh_public_key_path" {
  description = "Path to your SSH public key"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

# Region
variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc1"
}

# Droplet Size
variable "droplet_size" {
  description = "Droplet size (s-1vcpu-2gb, s-2vcpu-4gb, etc.)"
  type        = string
  default     = "s-2vcpu-4gb"
}

# GitHub Repository URL
variable "github_repo" {
  description = "GitHub repository URL for your project"
  type        = string
}

# PostgreSQL Configuration
variable "postgres_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "purple_dog_user"
}

variable "postgres_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "postgres_db" {
  description = "PostgreSQL database name"
  type        = string
  default     = "purple_dog_db"
}

