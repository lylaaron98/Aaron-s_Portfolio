import React from 'react';

export const ProjectDescription: React.FC<{ description: string }> = ({ description }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <strong>Description:</strong>
    <div style={{ border: '1px dashed #444', minHeight: 60, padding: '1rem', marginTop: 8, color: '#bfc4cf' }}>
      {description}
    </div>
  </div>
);

export const ProjectGallery: React.FC = () => (
  <div style={{ marginBottom: '1.5rem' }}>
    <strong>Gallery:</strong>
    <div style={{ border: '1px dashed #444', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
      Gallery Placeholder
    </div>
  </div>
);

export const ProjectVideo: React.FC = () => (
  <div style={{ marginBottom: '1.5rem' }}>
    <strong>Video:</strong>
    <div style={{ border: '1px dashed #444', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
      Video Placeholder
    </div>
  </div>
);

export const ProjectTechStack: React.FC<{ tech: string[] }> = ({ tech }) => (
  <div>
    <strong>Tech Stack:</strong>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {tech.map((t) => (
        <span key={t} style={{ background: '#23283a', color: '#bfc4cf', borderRadius: 6, padding: '2px 10px', fontSize: 13 }}>{t}</span>
      ))}
    </div>
  </div>
);
