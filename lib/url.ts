/**
 * Get the base URL for the application
 * Uses NEXT_PUBLIC_APP_URL if set, otherwise falls back to necis-laundry.vercel.app
 */
export function getBaseUrl(): string {
  // Check if we have environment variable set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Server-side: use default production URL
  if (typeof window === 'undefined') {
    return 'https://necis-laundry.vercel.app';
  }
  
  // Client-side: use window.location.origin (will be correct in production)
  // But if it's localhost, use production URL instead
  if (window.location.origin.includes('localhost')) {
    return 'https://necis-laundry.vercel.app';
  }
  
  return window.location.origin;
}

