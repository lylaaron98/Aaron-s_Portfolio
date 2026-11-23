import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react'
import type { HCaptcha as HCaptchaRef } from '@hcaptcha/react-hcaptcha'
import isEmail from 'validator/es/lib/isEmail'
import { sendContactMessage } from '../api/contact'
import { links } from './content'
import styles from './Orbit.module.css'

const hCaptchaSiteKey = '50b2fe65-b00b-4b9e-ad62-3ba471098be2'
const HCaptcha = lazy(() => import('@hcaptcha/react-hcaptcha'))

function validateEmail(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'Please enter your email address.'
  return isEmail(trimmed, { domain_specific_validation: true }) ? '' : 'Please enter a valid email address.'
}

/** Same contact flow as before (validation, hCaptcha, API), restyled. */
export default function OrbitContact() {
  const formRef = useRef<HTMLFormElement>(null)
  const captchaRef = useRef<HCaptchaRef | null>(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaError, setCaptchaError] = useState('')
  const [loadCaptcha, setLoadCaptcha] = useState(false)

  // The captcha script is heavy; load it only as the form comes into view.
  useEffect(() => {
    const node = formRef.current
    if (!node || loadCaptcha) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadCaptcha(true)
          observer.disconnect()
        }
      },
      { rootMargin: '320px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadCaptcha])

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (name === 'email') setEmailError(validateEmail(value))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nextEmailError = validateEmail(form.email)
    const nextCaptchaError = !loadCaptcha
      ? 'Captcha is loading. Please wait a moment.'
      : captchaToken
        ? ''
        : 'Please complete the captcha.'
    setEmailError(nextEmailError)
    setCaptchaError(nextCaptchaError)
    if (nextEmailError || nextCaptchaError) return

    setError('')
    setStatus('sending')
    try {
      await sendContactMessage({ ...form, captchaToken })
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
      setCaptchaToken('')
      window.setTimeout(() => setStatus('idle'), 5000)
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Message sending is unavailable. Please email me directly instead.')
    } finally {
      captchaRef.current?.resetCaptcha()
    }
  }

  const sending = status === 'sending'

  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-title">
      <div className={styles.contactIntro}>
        <p className={styles.kicker}>
          <span>05</span> Contact
        </p>
        <h2 id="contact-title" className={styles.contactTitle}>
          Let’s build something <em>considered.</em>
        </h2>
        <p className={styles.contactText}>
          Open to new roles and interesting problems. Send a note, or reach me directly.
        </p>
        <ul className={styles.contactLinks}>
          <li>
            <a href={links.email}>{links.emailText}</a>
          </li>
          <li>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn ↗
            </a>
          </li>
          <li>
            <a href={links.github} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          </li>
        </ul>
      </div>

      <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate>
        {status === 'sent' && (
          <p className={styles.formSuccess} role="status">
            Thanks, your message is on its way.
          </p>
        )}
        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
        <div className={styles.field}>
          <input id="name" name="name" placeholder=" " value={form.name} onChange={onChange} disabled={sending} required />
          <label htmlFor="name">Name</label>
        </div>
        <div className={styles.field}>
          <input
            id="email"
            name="email"
            type="email"
            placeholder=" "
            value={form.email}
            onChange={onChange}
            disabled={sending}
            aria-invalid={emailError ? 'true' : 'false'}
            aria-describedby={emailError ? 'email-error' : undefined}
            required
          />
          <label htmlFor="email">Email</label>
          {emailError && (
            <span id="email-error" className={styles.fieldError}>
              {emailError}
            </span>
          )}
        </div>
        <div className={styles.field}>
          <textarea id="message" name="message" rows={5} placeholder=" " value={form.message} onChange={onChange} disabled={sending} required />
          <label htmlFor="message">Message</label>
        </div>
        <div className={styles.captcha}>
          {loadCaptcha ? (
            <Suspense fallback={<span className={styles.captchaNote}>Loading captcha…</span>}>
              <HCaptcha
                ref={captchaRef}
                sitekey={hCaptchaSiteKey}
                reCaptchaCompat={false}
                theme="dark"
                onVerify={(token) => {
                  setCaptchaToken(token)
                  setCaptchaError('')
                }}
                onExpire={() => {
                  setCaptchaToken('')
                  setCaptchaError('Captcha expired. Please verify again.')
                }}
                onError={() => {
                  setCaptchaToken('')
                  setCaptchaError('Captcha could not be loaded. Please refresh and try again.')
                }}
              />
            </Suspense>
          ) : (
            <span className={styles.captchaNote}>Captcha loads as you reach the form.</span>
          )}
          {captchaError && <span className={styles.fieldError}>{captchaError}</span>}
        </div>
        <button type="submit" className={styles.primary} disabled={sending}>
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </section>
  )
}
