import React from 'react';

interface ResultCardProps {
  name: string;
  genre: string;
  topTags: string[];
  location: string;
  urls: {
    website?: string;
    vimeo?: string;
    email?: string;
  };
  score: number;
  reason: string;
}

export default function ResultCard({
  name,
  genre,
  topTags,
  location,
  urls,
  score,
  reason,
}: ResultCardProps) {
  return (
    <div style={{
      border: '2px solid rgba(100, 200, 255, 0.3)',
      borderRadius: '20px',
      padding: '28px',
      background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(100, 200, 255, 0.05) 100%)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(100, 200, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.6)';
      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 200, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(100, 200, 255, 0.15) 100%)';
      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
      e.currentTarget.style.boxShadow = '0 16px 48px rgba(100, 200, 255, 0.4), 0 0 80px rgba(100, 200, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.3)';
      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 200, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(100, 200, 255, 0.05) 100%)';
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(100, 200, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
    }}
    >
      {/* Header with name, genre, and score */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '16px',
        gap: '16px',
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: '-0.01em',
            marginBottom: '6px',
          }}>
            {name}
          </h3>
          {genre && (
            <p style={{ 
              margin: 0, 
              color: '#64c8ff', 
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {genre}
            </p>
          )}
        </div>
        <div style={{
          background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.3) 0%, rgba(100, 200, 255, 0.2) 100%)',
          border: '2px solid rgba(100, 200, 255, 0.5)',
          padding: '10px 20px',
          borderRadius: '14px',
          fontSize: '18px',
          fontWeight: '700',
          color: '#64c8ff',
          minWidth: '70px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(100, 200, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          textShadow: '0 0 20px rgba(100, 200, 255, 0.5)',
        }}>
          {(score * 100).toFixed(0)}%
        </div>
      </div>

      {/* Tags */}
      {topTags.length > 0 && (
        <div style={{ 
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          {topTags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.2) 0%, rgba(100, 200, 255, 0.1) 100%)',
                border: '1.5px solid rgba(100, 200, 255, 0.4)',
                color: '#64c8ff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                letterSpacing: '0.3px',
                boxShadow: '0 2px 8px rgba(100, 200, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 200, 255, 0.35) 0%, rgba(100, 200, 255, 0.25) 100%)';
                e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 200, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 200, 255, 0.2) 0%, rgba(100, 200, 255, 0.1) 100%)';
                e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(100, 200, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Location */}
      {location && (
        <div style={{ 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>📍</span>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: 'rgba(255, 255, 255, 0.7)',
          }}>
            {location}
          </p>
        </div>
      )}

      {/* Video sample placeholder */}
      <div style={{
        marginBottom: '20px',
        borderRadius: '12px',
        backgroundColor: 'rgba(100, 200, 255, 0.05)',
        border: '1px dashed rgba(100, 200, 255, 0.3)',
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.05)';
        e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.3)';
      }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#64c8ff" 
            strokeWidth="2"
            style={{ opacity: 0.6 }}
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span style={{
            fontSize: '12px',
            color: 'rgba(100, 200, 255, 0.6)',
            fontWeight: '400',
          }}>
            Sample Videos
          </span>
        </div>
      </div>

      {/* Links */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        {urls.website && (
          <a
            href={urls.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              fontSize: '13px', 
              color: '#64c8ff', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(100, 200, 255, 0.05)',
              border: '1px solid rgba(100, 200, 255, 0.2)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.2)';
            }}
          >
            <span>🌐</span>
            <span>Website</span>
          </a>
        )}
        {urls.vimeo && (
          <a
            href={urls.vimeo}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              fontSize: '13px', 
              color: '#64c8ff', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(100, 200, 255, 0.05)',
              border: '1px solid rgba(100, 200, 255, 0.2)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.2)';
            }}
          >
            <span>🎬</span>
            <span>Vimeo</span>
          </a>
        )}
        {urls.email && (
          <a
            href={`mailto:${urls.email}`}
            style={{ 
              fontSize: '13px', 
              color: '#64c8ff', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(100, 200, 255, 0.05)',
              border: '1px solid rgba(100, 200, 255, 0.2)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.2)';
            }}
          >
            <span>✉️</span>
            <span>Email</span>
          </a>
        )}
      </div>
      
      {/* Match reason */}
      {reason && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(100, 200, 255, 0.1)',
        }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontStyle: 'italic',
            lineHeight: '1.5',
          }}>
            {reason}
          </p>
        </div>
      )}
    </div>
  );
}





