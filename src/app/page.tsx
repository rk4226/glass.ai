'use client';
import { useState, useEffect } from 'react';
import './styles/background.css';
import './styles/header.css';
import './styles/loading.css';

const PROMPT_SUGGESTIONS = [
  "A serene Japanese garden with cherry blossoms at sunset",
  "A futuristic cityscape with flying cars and neon lights",
  "A magical forest with glowing mushrooms and fairy lights",
  "An underwater palace with mermaids and bioluminescent creatures"
];

const downloadImage = async (imageUrl: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glass-ai-${Date.now()}.png`; // unique filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
  }
};

export default function Images() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pixels, setPixels] = useState<number[]>([]);

  useEffect(() => {
    if (loading) {
      setPixels([]);
      let count = 0;
      const totalPixels = 576; // 32x18 grid to match 16:9 aspect ratio
      const interval = setInterval(() => {
        if (count < totalPixels) {
          setPixels(prev => [...prev, count]);
          count++;
        } else {
          clearInterval(interval);
        }
      }, 15); // slightly faster animation

      return () => clearInterval(interval);
    }
  }, [loading]);

  const generateImage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="animated-background min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center gap-8 p-8">
        <h1 className="glass-text">
          <span className="glass-text-content">Glass.AI</span>
        </h1>
        
        {error && (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}

        {loading ? (
          <div className="mt-4 w-full flex justify-center">
            <div className="loading-container">
              {pixels.map((index) => (
                <div
                  key={index}
                  className="pixel"
                  style={{
                    animationDelay: `${index * 15}ms`,
                    backgroundColor: `hsla(${Math.random() * 360}, 70%, 70%, 0.3)`
                  }}
                />
              ))}
              <div className="loading-text">
                <p>Building your masterpiece...</p>
                <p className="text-sm mt-2 opacity-75">Placing pixels one by one...</p>
              </div>
            </div>
          </div>
        ) : imageUrl && (
          <div className="mt-4 w-full flex flex-col items-center gap-4">
            <img
              src={imageUrl}
              alt="Generated image"
              className="w-full max-w-2xl rounded-lg shadow-lg"
            />
            <button
              onClick={() => downloadImage(imageUrl)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Image
            </button>
          </div>
        )}
      </div>

      {/* Fixed bottom prompt interface */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto p-6">
          <div className="flex flex-col gap-4">
            {/* Prompt suggestions */}
            {!prompt && !loading && (
              <div className="flex flex-wrap gap-2 mb-2">
                {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white backdrop-blur-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {/* Input area */}
            <div className="flex gap-4">
              <div className="flex-1 bg-white/10 rounded-lg overflow-hidden shadow-inner">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className="w-full bg-transparent text-white placeholder-white/50 p-4 resize-none focus:outline-none text-base"
                  rows={1}
                  style={{ minHeight: '56px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (prompt && !loading) {
                        generateImage();
                      }
                    }
                  }}
                />
              </div>
              <button
                onClick={generateImage}
                disabled={loading || !prompt}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-white/50 text-center tracking-wide">
            Press Enter to generate, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
