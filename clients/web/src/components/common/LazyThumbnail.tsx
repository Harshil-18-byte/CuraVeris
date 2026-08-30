'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analytics } from '../../lib/analytics/events';

interface LazyThumbnailProps {
  src?: string;
  alt: string;
  fallbackLabel?: string;
  width?: string | number;
  height?: string | number;
  onRetry?: () => void;
}

export function LazyThumbnail({
  src,
  alt,
  fallbackLabel = 'DOCUMENT THUMBNAIL',
  width = '100%',
  height = '180px',
  onRetry,
}: LazyThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(!src);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = () => {
    setHasError(true);
    analytics.track('image_fetch_failure', {
      src,
      alt,
      retry_count: retryCount,
      timestamp: new Date().toISOString(),
    });
  };

  const handleManualRetry = () => {
    setHasError(false);
    setIsLoaded(false);
    setRetryCount((prev) => prev + 1);
    if (onRetry) onRetry();
  };

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatePresence>
        {!hasError && src && (
          <motion.img
            key={src + retryCount}
            src={src}
            alt={alt}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '50px' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onLoad={() => setIsLoaded(true)}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: isLoaded ? 'block' : 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Fallback & Empty State with Retry */}
      {(hasError || !src) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: '1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
            [{fallbackLabel}]
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {alt}
          </span>
          {onRetry && (
            <button
              type="button"
              onClick={handleManualRetry}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.6875rem', padding: '0.2rem 0.6rem', marginTop: '0.25rem' }}
            >
              Retry Load [→]
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
