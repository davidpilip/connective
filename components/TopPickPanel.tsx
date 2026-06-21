import React from 'react';

interface SimilarBrief {
  brand: string;
  filename: string;
  vibe: string;
  genre: string[];
  specialties: string[];
  tone: string;
  style: string;
  similarity: number;
  textSnippet: string;
}

interface TopPickDirector {
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

interface TopPickPanelProps {
  director: TopPickDirector;
  topPickReason: string;
  similarBriefs: SimilarBrief[];
}

export default function TopPickPanel({
  director,
  topPickReason,
  similarBriefs,
}: TopPickPanelProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 200,
        background:
          'linear-gradient(160deg, rgba(100, 200, 255, 0.12) 0%, rgba(0, 212, 255, 0.06) 50%, rgba(100, 200, 255, 0.08) 100%)',
        border: '2px solid rgba(100, 200, 255, 0.35)',
        borderRadius: '24px',
        padding: '28px 24px',
        backdropFilter: 'blur(20px)',
        boxShadow:
          '0 12px 48px rgba(100, 200, 255, 0.2), 0 0 60px rgba(100, 200, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        maxHeight: 'calc(100vh - 230px)',
        overflowY: 'auto',
      }}
    >
      {/* Header badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background:
            'linear-gradient(135deg, rgba(255, 200, 50, 0.25) 0%, rgba(255, 180, 0, 0.15) 100%)',
          border: '1.5px solid rgba(255, 200, 50, 0.5)',
          borderRadius: '10px',
          marginBottom: '20px',
        }}
      >
        <span style={{ fontSize: '16px' }}>⭐</span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#ffc832',
          }}
        >
          Top Pick
        </span>
      </div>

      {/* Director name & score */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: '1.2',
          }}
        >
          {director.name}
        </h2>
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(100, 200, 255, 0.35) 0%, rgba(0, 212, 255, 0.25) 100%)',
            border: '2px solid rgba(100, 200, 255, 0.6)',
            padding: '6px 14px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            color: '#64c8ff',
            whiteSpace: 'nowrap',
            boxShadow:
              '0 4px 12px rgba(100, 200, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            textShadow: '0 0 15px rgba(100, 200, 255, 0.5)',
          }}
        >
          {(director.score * 100).toFixed(0)}%
        </div>
      </div>

      {/* Genre & Location */}
      <div style={{ marginBottom: '16px' }}>
        {director.genre && (
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '13px',
              fontWeight: '600',
              color: '#64c8ff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {director.genre}
          </p>
        )}
        {director.location && (
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '12px' }}>📍</span>
            {director.location}
          </p>
        )}
      </div>

      {/* Specialties */}
      {director.topTags.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '18px',
          }}
        >
          {director.topTags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: '500',
                background:
                  'linear-gradient(135deg, rgba(100, 200, 255, 0.2) 0%, rgba(100, 200, 255, 0.1) 100%)',
                border: '1px solid rgba(100, 200, 255, 0.4)',
                borderRadius: '6px',
                color: '#64c8ff',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* GPT reason */}
      {topPickReason && (
        <div
          style={{
            marginBottom: '20px',
            padding: '16px',
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(100, 200, 255, 0.04) 100%)',
            borderRadius: '14px',
            border: '1px solid rgba(100, 200, 255, 0.15)',
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            Why this director
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: '1.6',
            }}
          >
            {topPickReason}
          </p>
        </div>
      )}

      {/* Links */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        {director.urls.vimeo && (
          <a
            href={director.urls.vimeo}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              color: '#64c8ff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(100, 200, 255, 0.08)',
              border: '1px solid rgba(100, 200, 255, 0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(100, 200, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(100, 200, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.25)';
            }}
          >
            <span>🎬</span>
            <span>Reel</span>
          </a>
        )}
        {director.urls.website && (
          <a
            href={director.urls.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              color: '#64c8ff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(100, 200, 255, 0.08)',
              border: '1px solid rgba(100, 200, 255, 0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(100, 200, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(100, 200, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.25)';
            }}
          >
            <span>🌐</span>
            <span>Website</span>
          </a>
        )}
        {director.urls.email && (
          <a
            href={`mailto:${director.urls.email}`}
            style={{
              fontSize: '12px',
              color: '#64c8ff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(100, 200, 255, 0.08)',
              border: '1px solid rgba(100, 200, 255, 0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(100, 200, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(100, 200, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.25)';
            }}
          >
            <span>✉️</span>
            <span>Email</span>
          </a>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, rgba(100, 200, 255, 0.3), transparent)',
          marginBottom: '20px',
        }}
      />

      {/* Similar Agency Briefs */}
      {similarBriefs.length > 0 && (
        <div>
          <p
            style={{
              margin: '0 0 14px 0',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: '#64c8ff',
            }}
          >
            Related Briefs
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {similarBriefs.map((brief, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(100, 200, 255, 0.03) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(100, 200, 255, 0.15)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    'rgba(100, 200, 255, 0.35)';
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(100, 200, 255, 0.06) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    'rgba(100, 200, 255, 0.15)';
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(100, 200, 255, 0.03) 100%)';
                }}
              >
                {/* Brand + similarity */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                    }}
                  >
                    {brief.brand}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: 'rgba(100, 200, 255, 0.7)',
                      padding: '3px 8px',
                      background: 'rgba(100, 200, 255, 0.1)',
                      borderRadius: '6px',
                    }}
                  >
                    {(brief.similarity * 100).toFixed(0)}%
                  </span>
                </div>

                {/* PDF Link */}
                {brief.filename && (
                  <a
                    href={`/api/brief-pdf?file=${encodeURIComponent(brief.filename)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: '#64c8ff',
                      textDecoration: 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(100, 200, 255, 0.08)',
                      border: '1px solid rgba(100, 200, 255, 0.2)',
                      marginBottom: '8px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.2)';
                    }}
                  >
                    <span>📄</span>
                    <span>View Brief PDF</span>
                  </a>
                )}

                {/* Vibe + tone */}
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap',
                    marginBottom: '6px',
                  }}
                >
                  {brief.vibe && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '500',
                        padding: '3px 8px',
                        background: 'rgba(255, 200, 50, 0.12)',
                        border: '1px solid rgba(255, 200, 50, 0.3)',
                        borderRadius: '5px',
                        color: '#ffc832',
                        textTransform: 'capitalize',
                      }}
                    >
                      {brief.vibe}
                    </span>
                  )}
                  {brief.tone && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '500',
                        padding: '3px 8px',
                        background: 'rgba(100, 200, 255, 0.12)',
                        border: '1px solid rgba(100, 200, 255, 0.3)',
                        borderRadius: '5px',
                        color: '#64c8ff',
                        textTransform: 'capitalize',
                      }}
                    >
                      {brief.tone}
                    </span>
                  )}
                  {brief.style && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '500',
                        padding: '3px 8px',
                        background: 'rgba(180, 130, 255, 0.12)',
                        border: '1px solid rgba(180, 130, 255, 0.3)',
                        borderRadius: '5px',
                        color: '#b482ff',
                        textTransform: 'capitalize',
                      }}
                    >
                      {brief.style}
                    </span>
                  )}
                </div>

                {/* Genre tags */}
                {brief.genre.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {brief.genre.map((g, gIdx) => (
                      <span
                        key={gIdx}
                        style={{
                          fontSize: '9px',
                          fontWeight: '500',
                          padding: '2px 6px',
                          background: 'rgba(100, 200, 255, 0.08)',
                          borderRadius: '4px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
