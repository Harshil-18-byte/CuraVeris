'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrueFocus } from '../ui/TrueFocus';
import { useDevice } from '../../providers/DeviceProvider';

interface MobileStartupSplashProps {
  onComplete?: () => void;
  autoDismissMs?: number;
}

export function MobileStartupSplash({
  onComplete,
  autoDismissMs = 2800,
}: MobileStartupSplashProps) {
  const { isMobileMode } = useDevice();
  const [isVisible, setIsVisible] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  useEffect(() => {
    // Only trigger once per active browser session
    if (typeof window !== 'undefined') {
      const seen = sessionStorage.getItem('curaveris_mobile_splash_seen');
      if (seen) {
        setIsVisible(false);
        setHasSeenSplash(true);
        if (onComplete) onComplete();
        return;
      }
    }

    // Auto-advance within 2.8 seconds (<= 3s limit)
    const timer = setTimeout(() => {
      handleDismiss();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs]);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasSeenSplash(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('curaveris_mobile_splash_seen', 'true');
    }
    if (onComplete) onComplete();
  };

  // Only render on phone mode
  if (!isMobileMode || hasSeenSplash || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'var(--bg-canvas, #090D16)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4rem 1.5rem 2.5rem',
            textAlign: 'center',
          }}
        >
          {/* Top Status */}
          <div>
            <span className="badge badge-brand" style={{ fontSize: '0.6875rem' }}>
              SECTION 65B • STATUTORY ADVOCACY
            </span>
          </div>

          {/* Center Focus Hero */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '100%', maxWidth: '340px' }}>
            <TrueFocus
              sentence="CuraVeris Financial Truth"
              manualMode={false}
              blurAmount={4}
              borderColor="var(--color-brand, #2563EB)"
              glowColor="rgba(37, 99, 235, 0.4)"
              animationDuration={0.35}
              pauseBetweenAnimations={0.25}
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted, #94A3B8)',
                lineHeight: 1.5,
                maxWidth: '290px',
                margin: '0 auto',
              }}
            >
              Automated medical bill audit & statutory dispute resolution under official Gazette price controls.
            </motion.p>
          </div>

          {/* Bottom Controls */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleDismiss}
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-dim, #64748B)',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              Skip Intro [→]
            </button>

            <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim, #64748B)', fontFamily: 'var(--font-mono, monospace)' }}>
              Starting Mobile Audit Engine...
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
