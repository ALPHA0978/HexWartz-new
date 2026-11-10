import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, Volume2, VolumeX, X } from 'lucide-react';

const LINKS = [['venue', 'Venue'], ['houses', 'Tracks'], ['journey', 'Details'], ['prizes', 'Prizes'], ['registration', 'The Prophet'], ['faq', 'FAQ'], ['contact', 'Contact']];

export default function FloatingHeader({ registrationUrl, isMusicPlaying, onToggleMusic }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef(null);
  const hiddenRef = useRef(false);
  const updateHidden = next => {
    if (hiddenRef.current === next) return;
    hiddenRef.current = next;
    setHidden(next);
  };

  useEffect(() => {
    let anchor = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const current = Math.max(0, window.scrollY);
      const focus = document.activeElement;
      const keyboardFocus = focus instanceof Element && focus.matches(':focus-visible') && headerRef.current?.contains(focus);
      if (current < 90 || menuOpen || keyboardFocus) {
        updateHidden(false);
        anchor = current;
      } else if (Math.abs(current - anchor) > 12) {
        updateHidden(current > anchor);
        anchor = current;
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    return () => { window.removeEventListener('scroll', schedule); cancelAnimationFrame(frame); };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        headerRef.current?.querySelector('.landing-menu-toggle')?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="landing-header floating-header" data-hidden={hidden && !menuOpen} onFocus={() => updateHidden(false)}>
      <a className="landing-brand" href="#home" aria-label="HexWartz home" onClick={() => setMenuOpen(false)}>
        <img src="/assets/branding/hexwartz_crest_nav.webp" alt="" className="landing-brand-crest" width="42" height="42" decoding="async" />
        <div className="landing-brand-text"><span className="landing-brand-name">HexWartz</span><span className="landing-brand-sub">Sharda University Agra</span></div>
      </a>
      <nav id="main-navigation" className={`landing-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        {LINKS.map(([id, title]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{title}</a>)}
        <a className="landing-nav-cta" href={registrationUrl} target="_blank" rel="noopener noreferrer">Register <ArrowUpRight size={15} aria-hidden="true" /></a>
      </nav>
      <div className="header-controls">
        <button type="button" className="header-music-toggle" onClick={onToggleMusic} aria-label={isMusicPlaying ? 'Mute sound' : 'Play sound'} aria-pressed={isMusicPlaying} title={isMusicPlaying ? 'Mute sound' : 'Play sound'}>
          {isMusicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button className="landing-menu-toggle" type="button" aria-controls="main-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => { updateHidden(false); setMenuOpen(open => !open); }}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}
