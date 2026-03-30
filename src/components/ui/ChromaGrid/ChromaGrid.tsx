import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEventHandler, PointerEvent as ReactPointerEvent } from 'react'
import gsap from 'gsap'
import './ChromaGrid.css'

export interface ChromaItem {
  image?: string
  fallbackImage?: string
  title: string
  subtitle: string
  handle?: string
  location?: string
  borderColor?: string
  gradient?: string
  url?: string
  isVideo?: boolean
  previewable?: boolean
}

export interface ChromaGridProps {
  items?: ChromaItem[]
  className?: string
  radius?: number
  columns?: number
  rows?: number
  damping?: number
  fadeOut?: number
  ease?: string
  onImageClick?: (image: string, title?: string) => void
}

type SetterFn = (value: number | string) => void

function ChromaCardMedia({ item }: { item: ChromaItem }) {
  const [src, setSrc] = useState(item.image)

  useEffect(() => {
    setSrc(item.image)
  }, [item.image])

  const handleFallback = () => {
    if (item.fallbackImage && src !== item.fallbackImage) {
      setSrc(item.fallbackImage)
    }
  }

  if (!src) {
    return null
  }

  if (item.isVideo) {
    return (
      <video
        key={src}
        controls
        preload="metadata"
        playsInline
        onError={handleFallback}
        style={{ width: '100%', height: '100%', borderRadius: 12, display: 'block', background: '#18181b' }}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    )
  }

  return <img src={src} alt={item.title} loading="lazy" onError={handleFallback} />
}

const demoItems: ChromaItem[] = [
  {
    image: 'https://i.pravatar.cc/300?img=8',
    title: 'Alex Rivera',
    subtitle: 'Full Stack Developer',
    handle: '@alexrivera',
    borderColor: '#4F46E5',
    gradient: 'linear-gradient(145deg, #4F46E5, #000)',
    url: 'https://github.com/',
  },
  {
    image: 'https://i.pravatar.cc/300?img=11',
    title: 'Jordan Chen',
    subtitle: 'DevOps Engineer',
    handle: '@jordanchen',
    borderColor: '#10B981',
    gradient: 'linear-gradient(210deg, #10B981, #000)',
    url: 'https://linkedin.com/in/',
  },
  {
    image: 'https://i.pravatar.cc/300?img=3',
    title: 'Morgan Blake',
    subtitle: 'UI/UX Designer',
    handle: '@morganblake',
    borderColor: '#F59E0B',
    gradient: 'linear-gradient(165deg, #F59E0B, #000)',
    url: 'https://dribbble.com/',
  },
  {
    image: 'https://i.pravatar.cc/300?img=16',
    title: 'Casey Park',
    subtitle: 'Data Scientist',
    handle: '@caseypark',
    borderColor: '#EF4444',
    gradient: 'linear-gradient(195deg, #EF4444, #000)',
    url: 'https://kaggle.com/',
  },
  {
    image: 'https://i.pravatar.cc/300?img=25',
    title: 'Sam Kim',
    subtitle: 'Mobile Developer',
    handle: '@thesamkim',
    borderColor: '#8B5CF6',
    gradient: 'linear-gradient(225deg, #8B5CF6, #000)',
    url: 'https://github.com/',
  },
  {
    image: 'https://i.pravatar.cc/300?img=60',
    title: 'Tyler Rodriguez',
    subtitle: 'Cloud Architect',
    handle: '@tylerrod',
    borderColor: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4, #000)',
    url: 'https://aws.amazon.com/',
  },
]

export default function ChromaGrid({
  items,
  className = '',
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
  onImageClick,
}: ChromaGridProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)
  const setX = useRef<SetterFn | null>(null)
  const setY = useRef<SetterFn | null>(null)
  const pos = useRef({ x: 0, y: 0 })
  const data = items?.length ? items : demoItems

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    setX.current = gsap.quickSetter(el, '--x', 'px') as SetterFn
    setY.current = gsap.quickSetter(el, '--y', 'px') as SetterFn

    const { width, height } = el.getBoundingClientRect()
    pos.current = { x: width / 2, y: height / 2 }
    setX.current(pos.current.x)
    setY.current(pos.current.y)
  }, [])

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x)
        setY.current?.(pos.current.y)
      },
      overwrite: true,
    })
  }

  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = rootRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    moveTo(e.clientX - rect.left, e.clientY - rect.top)
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true })
  }

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true,
    })
  }

  const handleCardClick = (item: ChromaItem) => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
      return
    }

    if (item.isVideo || item.previewable === false) {
      return
    }

    if (onImageClick && item.image) {
      onImageClick(item.image, item.title)
    }
  }

  const handleCardMove: MouseEventHandler<HTMLElement> = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`.trim()}
      style={
        {
          '--r': `${radius}px`,
          '--cols': columns,
          '--rows': rows,
        } as CSSProperties
      }
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {data.map((item) => (
        <article
          key={item.title}
          className={`chroma-card${item.image ? '' : ' no-image'}`}
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(item)}
          style={
            {
              '--card-border': item.borderColor || 'transparent',
              '--card-gradient': item.gradient || 'linear-gradient(160deg, #1f2937, #020617)',
              cursor:
                item.url || (!item.isVideo && item.previewable !== false) ? 'pointer' : 'default',
            } as CSSProperties
          }
        >
          {item.image && (
            <div className="chroma-img-wrapper">
              <ChromaCardMedia item={item} />
            </div>
          )}
          <footer className="chroma-info">
            <h3 className="name">{item.title}</h3>
            {item.handle && <span className="handle">{item.handle}</span>}
            <p className="role">{item.subtitle}</p>
            {item.location && <span className="location">{item.location}</span>}
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  )
}
