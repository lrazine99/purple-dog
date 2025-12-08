output "droplet_ip" {
  description = "Public IP address of the droplet"
  value       = digitalocean_droplet.purple_dog.ipv4_address
}

output "droplet_id" {
  description = "ID of the droplet"
  value       = digitalocean_droplet.purple_dog.id
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "http://${digitalocean_droplet.purple_dog.ipv4_address}:3000"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${digitalocean_droplet.purple_dog.ipv4_address}:3001"
}

output "ssh_command" {
  description = "SSH command to connect to the droplet"
  value       = "ssh root@${digitalocean_droplet.purple_dog.ipv4_address}"
}

