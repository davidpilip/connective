'use client';

import React, { useState, useEffect, useRef } from 'react';
import ResultCard from '@/components/ResultCard';
import TopPickPanel from '@/components/TopPickPanel';

interface SearchResult {
  id: string;
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

interface VibeAnalysis {
  vibe: string;
  cinematicKnowHow: string;
  themes: string[];
  genre: string[];
  specialties: string[];
  tone: string;
  visualStyle: string;
}

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

const SAMPLE_PROMPTS = [
  'Need a comedy director for a car commercial',
  'Looking for someone who does lifestyle and beauty content',
  'Sports director with automotive experience',
  'Director who can do VFX-heavy action spots',
];

const GENRES = [
  'All Genres',
  'STORYTELLING',
  'DANCE',
  'CAR',
  'BEAUTY',
  'FASHION',
  'LIFESTYLE',
  'SPORTS',
  'MUSIC',
  'DOCUMENTARY',
  'ACTION',
  'COMEDY',
];

const LOCATIONS = [
  'All Locations',
  'Los Angeles',
  'London',
  'New York',
  'Paris',
  'Munich',
  'Berlin',
  'Amsterdam',
  'Toronto',
  'Sydney',
  'Tokyo',
];

export default function Home() {
  const [brief, setBrief] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileText, setFileText] = useState('');
  const [processedInfo, setProcessedInfo] = useState({ images: 0, texts: 0 });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [vibeAnalysis, setVibeAnalysis] = useState<VibeAnalysis | null>(null);
  const [similarBriefs, setSimilarBriefs] = useState<SimilarBrief[]>([]);
  const [topPickReason, setTopPickReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [showFilters, setShowFilters] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Filter results when filters change
  useEffect(() => {
    let filtered = [...results];
    
    if (selectedGenre !== 'All Genres') {
      filtered = filtered.filter(r => r.genre === selectedGenre);
    }
    
    if (selectedLocation !== 'All Locations') {
      filtered = filtered.filter(r => r.location === selectedLocation);
    }
    
    setFilteredResults(filtered);
  }, [results, selectedGenre, selectedLocation]);

  const processFiles = async (fileList: File[]) => {
    if (fileList.length === 0) return;

    setFiles(Array.from(fileList));
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      fileList.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const data = await response.json();
      setFileText(data.fileText);
      setProcessedInfo({ 
        images: data.processedImages || 0, 
        texts: data.processedTextFiles || 0 
      });
    } catch (err) {
      setError('Failed to process files');
      setFiles([]);
      setFileText('');
      setProcessedInfo({ images: 0, texts: 0 });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    await processFiles(selectedFiles);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await processFiles(droppedFiles);
    }
  };

  const handleSearch = async () => {
    if (!brief.trim()) {
      setError('Please enter a brief');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: brief,
          fileText: fileText || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results);
      setFilteredResults(data.results);
      setVibeAnalysis(data.vibeAnalysis || null);
      setSimilarBriefs(data.similarBriefs || []);
      setTopPickReason(data.topPickReason || '');
      setSelectedGenre('All Genres');
      setSelectedLocation('All Locations');
      
      // Scroll to results
      setTimeout(() => {
        if (searchAreaRef.current) {
          searchAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setBrief(prompt);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        html, body {
          overflow-x: hidden;
          overflow-y: auto;
          height: auto;
        }
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        select {
          background: linear-gradient(135deg, rgba(100, 200, 255, 0.15) 0%, rgba(100, 200, 255, 0.05) 100%);
          color: #ffffff;
          border: 2px solid rgba(100, 200, 255, 0.4);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%2364c8ff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 40px;
          box-shadow: 0 4px 12px rgba(100, 200, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        select:hover {
          border-color: rgba(100, 200, 255, 0.7);
          background: linear-gradient(135deg, rgba(100, 200, 255, 0.25) 0%, rgba(100, 200, 255, 0.15) 100%);
          box-shadow: 0 6px 20px rgba(100, 200, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }
        select:focus {
          outline: none;
          border-color: rgba(100, 200, 255, 0.9);
          background: linear-gradient(135deg, rgba(100, 200, 255, 0.3) 0%, rgba(100, 200, 255, 0.2) 100%);
          box-shadow: 0 8px 24px rgba(100, 200, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        select option {
          background-color: #0a0a0a;
          color: #ffffff;
          padding: 12px;
        }
        @media (max-width: 900px) {
          .results-two-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    <main style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, rgba(100, 200, 255, 0.1) 0%, #000000 50%)',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}>
        {/* Sticky Search Area */}
        <div
          ref={searchAreaRef}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%)',
            borderBottom: '2px solid rgba(100, 200, 255, 0.3)',
            padding: '40px 24px',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 60px rgba(100, 200, 255, 0.1)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{
      maxWidth: '900px',
      margin: '0 auto',
          }}>
            <div style={{
              marginBottom: '40px',
              textAlign: 'center',
    }}>
      <h1 style={{
                fontSize: '56px',
                fontWeight: '800',
                marginBottom: '12px',
                color: '#ffffff',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 0%, #64c8ff 50%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(100, 200, 255, 0.3)',
                filter: 'drop-shadow(0 4px 20px rgba(100, 200, 255, 0.2))',
      }}>
        Director Matcher
      </h1>
      <p style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '0',
                fontWeight: '400',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              }}>
                AI-powered semantic search for finding the perfect director
              </p>
            </div>

            {/* Quick Start Prompts */}
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <p style={{
                fontSize: '12px',
                color: '#64c8ff',
                marginBottom: '16px',
          textTransform: 'uppercase',
                letterSpacing: '2px',
                fontWeight: '600',
                textShadow: '0 0 20px rgba(100, 200, 255, 0.5)',
        }}>
                Quick Start
        </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              style={{
                      padding: '12px 20px',
                      fontSize: '14px',
                      border: '2px solid rgba(100, 200, 255, 0.4)',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.15) 0%, rgba(100, 200, 255, 0.05) 100%)',
                      color: '#64c8ff',
                cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontWeight: '500',
                      boxShadow: '0 4px 12px rgba(100, 200, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 200, 255, 0.3) 0%, rgba(100, 200, 255, 0.2) 100%)';
                      e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(100, 200, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 200, 255, 0.15) 0%, rgba(100, 200, 255, 0.05) 100%)';
                      e.currentTarget.style.borderColor = 'rgba(100, 200, 255, 0.4)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 200, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

            {/* Project Brief */}
            <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#64c8ff',
                letterSpacing: '0.5px',
                textShadow: '0 0 10px rgba(100, 200, 255, 0.3)',
        }}>
          Project Brief
        </label>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe your project, style, tone, or what you're looking for in a director..."
          style={{
            width: '100%',
            minHeight: '120px',
                  padding: '18px',
                  fontSize: '15px',
                  border: '2px solid rgba(100, 200, 255, 0.3)',
                  borderRadius: '16px',
            fontFamily: 'inherit',
            resize: 'vertical',
                  background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(100, 200, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(100, 200, 255, 0.7)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(100, 200, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)';
                  e.target.style.boxShadow = '0 8px 32px rgba(100, 200, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'scale(1.01)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 200, 255, 0.3)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(100, 200, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)';
                  e.target.style.boxShadow = '0 4px 16px rgba(100, 200, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'scale(1)';
          }}
        />
      </div>

            {/* File Upload - Drag & Drop */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
                fontSize: '13px',
          fontWeight: '500',
          marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '0.3px',
        }}>
          Storyboards & References (optional)
        </label>
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  padding: '40px 24px',
                  border: isDragging 
                    ? '3px dashed rgba(100, 200, 255, 0.8)' 
                    : '2px dashed rgba(100, 200, 255, 0.4)',
                  borderRadius: '16px',
                  background: isDragging
                    ? 'linear-gradient(135deg, rgba(100, 200, 255, 0.2) 0%, rgba(100, 200, 255, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(100, 200, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                  textAlign: 'center',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isDragging 
                    ? '0 8px 32px rgba(100, 200, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : '0 4px 16px rgba(100, 200, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                }}
                onClick={() => {
                  if (!uploading && fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
        <input
                  ref={fileInputRef}
                  id="file-upload"
          type="file"
          accept=".txt,.pdf,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleFileChange}
          disabled={uploading}
          multiple
          style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    opacity: 0,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    zIndex: 1,
                  }}
                />
                <div style={{
                  pointerEvents: 'none',
                  zIndex: 0,
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '12px',
                  }}>
                    {isDragging ? '📥' : '📎'}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isDragging ? '#64c8ff' : 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '8px',
                  }}>
                    {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '12px',
                  }}>
                    or click to browse
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                    Supports: Images (JPG, PNG, GIF, WEBP) • Scripts (PDF, TXT)
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                marginTop: '12px',
              }}>
        {files.length > 0 && !uploading && (
          <div style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(100, 200, 255, 0.1)',
                    border: '1px solid rgba(100, 200, 255, 0.3)',
                    borderRadius: '8px',
            fontSize: '13px',
                    color: '#64c8ff',
                    fontWeight: '500',
          }}>
                    ✓ {processedInfo.images} image{processedInfo.images !== 1 ? 's' : ''}, {processedInfo.texts} text{processedInfo.texts !== 1 ? 's' : ''}
          </div>
        )}
                {uploading && (
          <div style={{
                    padding: '10px 16px',
            fontSize: '13px',
                    color: '#64c8ff',
                    fontWeight: '500',
                  }}>
                    🔍 Analyzing...
                  </div>
                )}
              </div>
              {files.length > 0 && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}>
                  {files.map((f, i) => f.name).join(', ')}
          </div>
        )}
      </div>

            {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={loading || !brief.trim()}
        style={{
                padding: '18px 40px',
                fontSize: '16px',
                fontWeight: '700',
                color: '#000000',
                background: loading || !brief.trim() 
                  ? 'linear-gradient(135deg, rgba(100, 200, 255, 0.2) 0%, rgba(100, 200, 255, 0.1) 100%)'
                  : 'linear-gradient(135deg, #64c8ff 0%, #00d4ff 100%)',
          border: 'none',
                borderRadius: '14px',
          cursor: loading || !brief.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px',
                boxShadow: loading || !brief.trim() 
                  ? 'none' 
                  : '0 8px 32px rgba(100, 200, 255, 0.5), 0 0 60px rgba(100, 200, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                width: '100%',
                textTransform: 'uppercase',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
        }}
        onMouseEnter={(e) => {
          if (!loading && brief.trim()) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #7dd3ff 0%, #00e5ff 100%)';
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(100, 200, 255, 0.6), 0 0 80px rgba(100, 200, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && brief.trim()) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #64c8ff 0%, #00d4ff 100%)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(100, 200, 255, 0.5), 0 0 60px rgba(100, 200, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
          }
        }}
      >
        {loading ? 'Searching...' : 'Find Directors'}
      </button>

      {/* Error message */}
      {error && (
        <div style={{
                marginTop: '16px',
          padding: '12px',
                backgroundColor: 'rgba(255, 100, 100, 0.1)',
                border: '1px solid rgba(255, 100, 100, 0.3)',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#ff6464',
        }}>
          {error}
        </div>
      )}
          </div>
        </div>

        {/* Results Area */}
        {results.length > 0 && (
          <div style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '60px 24px',
          }}>
            {/* Vibe Analysis Summary - full width above the two columns */}
            {vibeAnalysis && (
              <div style={{
                marginBottom: '40px',
                padding: '32px',
                background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(100, 200, 255, 0.1) 100%)',
                border: '2px solid rgba(100, 200, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(100, 200, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#64c8ff',
                  marginBottom: '20px',
                  letterSpacing: '-0.01em',
                  textShadow: '0 0 20px rgba(100, 200, 255, 0.3)',
                }}>
                  📋 Project Analysis
                </h2>
                
                {vibeAnalysis.vibe && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'rgba(255, 255, 255, 0.9)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      Overall Vibe
                    </h3>
                    <p style={{
                      fontSize: '16px',
                      color: '#ffffff',
                      margin: 0,
                      lineHeight: '1.6',
                    }}>
                      {vibeAnalysis.vibe}
                    </p>
                  </div>
                )}

                {vibeAnalysis.cinematicKnowHow && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'rgba(255, 255, 255, 0.9)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      Required Cinematic Skills
                    </h3>
                    <p style={{
                      fontSize: '16px',
                      color: '#ffffff',
                      margin: 0,
                      lineHeight: '1.6',
                    }}>
                      {vibeAnalysis.cinematicKnowHow}
                    </p>
                  </div>
                )}

                {vibeAnalysis.themes && vibeAnalysis.themes.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'rgba(255, 255, 255, 0.9)',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      Key Themes
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {vibeAnalysis.themes.map((theme, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.25) 0%, rgba(100, 200, 255, 0.15) 100%)',
                            border: '1.5px solid rgba(100, 200, 255, 0.5)',
                            borderRadius: '8px',
                            color: '#64c8ff',
                            boxShadow: '0 2px 8px rgba(100, 200, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(100, 200, 255, 0.2)',
                }}>
                  {vibeAnalysis.genre && vibeAnalysis.genre.length > 0 && (
                    <div>
                      <h4 style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Genre
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {vibeAnalysis.genre.map((g, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 10px',
                              fontSize: '12px',
                              background: 'rgba(100, 200, 255, 0.2)',
                              border: '1px solid rgba(100, 200, 255, 0.4)',
                              borderRadius: '6px',
                              color: '#64c8ff',
                            }}
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {vibeAnalysis.specialties && vibeAnalysis.specialties.length > 0 && (
                    <div>
                      <h4 style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Specialties
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {vibeAnalysis.specialties.slice(0, 5).map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 10px',
                              fontSize: '12px',
                              background: 'rgba(100, 200, 255, 0.2)',
                              border: '1px solid rgba(100, 200, 255, 0.4)',
                              borderRadius: '6px',
                              color: '#64c8ff',
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {vibeAnalysis.tone && (
                    <div>
                      <h4 style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Tone
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: '#ffffff',
                        margin: 0,
                      }}>
                        {vibeAnalysis.tone}
                      </p>
                    </div>
                  )}

                  {vibeAnalysis.visualStyle && (
                    <div>
                      <h4 style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Visual Style
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: '#ffffff',
                        margin: 0,
                      }}>
                        {vibeAnalysis.visualStyle}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Two-column layout: Top Pick left, Results right */}
            <div
              className="results-two-col"
              style={{
                display: 'grid',
                gridTemplateColumns: '340px 1fr',
                gap: '32px',
                alignItems: 'start',
              }}
            >
              {/* Left Panel - Top Pick */}
              <div>
                {filteredResults.length > 0 && (
                  <TopPickPanel
                    director={filteredResults[0]}
                    topPickReason={topPickReason}
                    similarBriefs={similarBriefs}
                  />
                )}
              </div>

              {/* Right Side - Results */}
              <div>
                {/* Filters */}
                <div style={{
                  marginBottom: '32px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#ffffff',
                    letterSpacing: '-0.01em',
                    margin: 0,
                  }}>
                    Results <span style={{ color: '#64c8ff', fontWeight: '400' }}>({filteredResults.length})</span>
                  </h2>
                  
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginLeft: 'auto',
                    flexWrap: 'wrap',
                  }}>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      style={{
                        minWidth: '160px',
                      }}
                    >
                      {GENRES.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      style={{
                        minWidth: '160px',
                      }}
                    >
                      {LOCATIONS.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results Grid */}
                {filteredResults.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gap: '20px',
                  }}>
                    {filteredResults.map((result) => (
                      <ResultCard key={result.id} {...result} />
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                    No directors match the selected filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </main>
    </>
  );
}
