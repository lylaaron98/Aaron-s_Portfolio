/**
 * Contact API layer.
 * Stub implementation — swap the body with a real provider later:
 *   - EmailJS
 *   - Vercel serverless function
 *   - Node/Express backend
 */

export interface ContactMessage {
  name: string
  email: string
  message: string
}

export async function sendContactMessage(data: ContactMessage): Promise<void> {
  // TODO: replace with real backend call
  console.log('stub contact request', data)
}
