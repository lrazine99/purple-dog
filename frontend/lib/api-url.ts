/**
 * Get the backend API URL for server-side API routes.
 * 
 * In Docker: Uses API_URL env var (http://backend:3001)
 * Locally: Falls back to NEXT_PUBLIC_API_URL (http://localhost:3001)
 * 
 * This should ONLY be used in API routes (server-side), not in client components.
 */
export function getBackendUrl(): string {
  // API_URL is set in Docker to use internal network (http://backend:3001)
  // Falls back to NEXT_PUBLIC_API_URL for local development without Docker
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
}

