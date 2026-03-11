import emailjs from '@emailjs/browser'

export interface ContactMessage {
  name: string
  email: string
  message: string
}

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export async function sendContactMessage(data: ContactMessage): Promise<void> {
  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS is not configured. Add VITE_EMAILJS_* environment variables to enable contact delivery.')
    return
  }

  await emailjs.send(
    serviceId,
    templateId,
    {
      from_name: data.name,
      from_email: data.email,
      message: data.message,
    },
    publicKey,
  )
}
