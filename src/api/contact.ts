import isEmail from 'validator/es/lib/isEmail'

export interface ContactMessage {
  name: string
  email: string
  message: string
  captchaToken?: string
}

interface Web3FormsResponse {
  success?: boolean
  message?: string
  body?: {
    message?: string
  }
}

const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
const fromName = import.meta.env.VITE_CONTACT_FROM_NAME || 'Aaron Lee Portfolio'
const endpoint = 'https://api.web3forms.com/submit'

function getMissingConfigKeys() {
  return [
    !accessKey && 'VITE_WEB3FORMS_ACCESS_KEY',
  ].filter(Boolean)
}

export async function sendContactMessage(data: ContactMessage): Promise<void> {
  const missingConfigKeys = getMissingConfigKeys()

  if (missingConfigKeys.length > 0) {
    throw new Error(`Web3Forms is not configured. Missing: ${missingConfigKeys.join(', ')}.`)
  }

  const trimmedName = data.name.trim()
  const trimmedEmail = data.email.trim()
  const trimmedMessage = data.message.trim()
  const captchaToken = data.captchaToken?.trim()
  const formData = new FormData()

  if (!isEmail(trimmedEmail, { domain_specific_validation: true })) {
    throw new Error('Please enter a valid email address.')
  }

  if (!captchaToken) {
    throw new Error('Please complete the captcha.')
  }

  formData.append('access_key', accessKey)
  formData.append('from_name', fromName)
  formData.append('subject', `Portfolio contact from ${trimmedName}`)
  formData.append('name', trimmedName)
  formData.append('email', trimmedEmail)
  formData.append('replyto', trimmedEmail)
  formData.append('message', trimmedMessage)
  formData.append('h-captcha-response', captchaToken)
  formData.append('botcheck', '')

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  })

  const result = (await response.json().catch(() => null)) as Web3FormsResponse | null
  const errorMessage =
    result?.message ||
    result?.body?.message ||
    'Message sending is currently unavailable. Please email me directly instead.'

  if (!response.ok || !result?.success) {
    throw new Error(errorMessage)
  }
}
