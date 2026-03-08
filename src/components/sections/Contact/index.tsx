import { useState, type FormEvent } from 'react'
import styles from './Contact.module.css'
import { useScrollReveal } from '../../../hooks/useScrollReveal'
import SectionContainer from '../../ui/SectionContainer'
import Button from '../../ui/Button'

export default function Contact() {
  const ref = useScrollReveal<HTMLDivElement>()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <SectionContainer id="contact" background="navy-light" number="04" title="Get In Touch">
      <div ref={ref} className={styles.inner}>
        <div className={styles.infoBlock}>
          <h3 className={styles.heading}>Let's Work Together</h3>
          <p className={styles.blurb}>
            I'm currently open to new opportunities. Whether you have a project in mind,
            a question, or just want to say hi — my inbox is always open. I'll do my
            best to get back to you!
          </p>
          <div className={styles.contactItems}>
            <a href="mailto:aaron@example.com" className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
              </span>
              aaron@example.com
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </span>
              linkedin.com/in/aaron
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </span>
              github.com/aaron
            </a>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {submitted && (
            <div className={styles.successMsg}>
              Thanks! I'll get back to you soon.
            </div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={6}
              placeholder="Your message..."
              value={form.message}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className={styles.submitBtn}>
            Send Message
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </Button>
        </form>
      </div>
    </SectionContainer>
  )
}
