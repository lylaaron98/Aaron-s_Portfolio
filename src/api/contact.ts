// @ts-ignore: No types for @emailjs/browser
import emailjs from '@emailjs/browser'

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
  // EmailJS integration
  const serviceId = 'YOUR_SERVICE_ID';
  const templateId = 'YOUR_TEMPLATE_ID';
  const userId = 'YOUR_PUBLIC_KEY';

  const templateParams = {
    from_name: data.name,
    from_email: data.email,
    message: data.message,
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, userId);
  } catch (error) {
    throw new Error('Failed to send email');
  }
}
