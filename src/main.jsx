import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Award, BookOpen, CalendarDays, ChevronDown, ChevronRight, ChevronUp, Clock, Lock, MapPin, MessageCircle, Phone, Scroll, ShieldAlert, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import EnchantedAtmosphere from './EnchantedAtmosphere';
import CinematicJourney from './CinematicJourney';
import FloatingHeader from './FloatingHeader';
import useTextReveal from './useTextReveal';
const InvitationLetter = lazy(() => import('./InvitationLetter'));
import './styles.css';
import './refinements.css';

const HOUSE_TRACKS = [
  {
    house: 'Gryffindor',
    track: 'AI / ML',
    mark: '01',
    tone: 'crimson',
    gem: 'Ruby',
    trait: 'Bravery & Audacity',
    banner: '/assets/optimized/house-gryffindor.webp',
    desc: 'Build intelligent agents and bold AI solutions.',
  },
  {
    house: 'Ravenclaw',
    track: 'Healthcare',
    mark: '02',
    tone: 'blue',
    gem: 'Sapphire',
    trait: 'Wisdom & Intellect',
    banner: '/assets/optimized/house-ravenclaw.webp',
    desc: 'Build technology that makes better care possible.',
  },
  {
    house: 'Hufflepuff',
    track: 'Sustainable Development Goals',
    mark: '03',
    tone: 'gold',
    gem: 'Topaz',
    trait: 'Loyalty & Dedication',
    banner: '/assets/optimized/house-hufflepuff.webp',
    desc: 'Create a cleaner, fairer, more sustainable future.',
  },
  {
    house: 'Slytherin',
    track: 'Open Innovation',
    mark: '04',
    tone: 'green',
    gem: 'Emerald',
    trait: 'Ambition & Cunning',
    banner: '/assets/optimized/house-slytherin.webp',
    desc: 'Bring an original idea. Explore what comes next.',
  },
];

const UNSTOP_URL = 'https://unstop.com/hackathons/hexwartz-sharda-university-agra-1778042';
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeU1ffu-uS2pBMyXtaqqbC_gtS7Eo_JN3EWyOn6dtXTU1gSmA/viewform?usp=publish-editor';
const GUIDELINES_URL = 'https://drive.google.com/file/d/1X1ZfZNC9EDlyI_O8IfjhlmZapnJ4y-pw/view?usp=sharing';
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/Fner6WCQeWkGPWcPmV60x7';

const FAQ_DATA = [
  {
    q: 'WHO CAN PARTICIPATE?',
    a: 'Open to undergraduate and postgraduate students from recognized institutions. Bring your student ID for campus entry.'
  },
  {
    q: 'HOW MANY MEMBERS IN A TEAM?',
    a: 'Teams must have 4–6 students, with a minimum of 4. Cross-college and cross-discipline teams are welcome. Each participant may join one team.'
  },
  {
    q: 'HOW DO THE TWO ROUNDS WORK?',
    a: 'Submit your idea deck on Unstop. Shortlisted teams join the 24-hour finale at Sharda University Agra on 13–14 November 2026. Entry is ₹250 per member.'
  },
  {
    q: 'WHAT IS THE ENTRY FEE?',
    a: '₹250 per member, including stay, meals, and an event kit. Teams of 4, 5, or 6 pay ₹1,000, ₹1,250, or ₹1,500 respectively.'
  },
  {
    q: 'WHAT CAN WE BUILD WITH?',
    a: 'Build your prototype during the 24-hour hackathon. Open-source tools, APIs, and declared AI assistants are allowed. Plagiarism leads to disqualification.'
  }
];

export function App() {
  const [loadInvitation, setLoadInvitation] = useState(false);
  const [wardResonating, setWardResonating] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [invitationOpen, setInvitationOpen] = useState(false);
  
  // Starting Screen & Video Sequence State
  const [introState, setIntroState] = useState('initial'); // 'initial' | 'buffering' | 'playing' | 'exiting' | 'entered'
  const [introFading, setIntroFading] = useState(false);
  const [introVideoUrl, setIntroVideoUrl] = useState(undefined);
  const audioRef = useRef(null);
  const introVideoRef = useRef(null);
  const soundContextRef = useRef(null);
  const revealTimerRef = useRef(0);
  const wardTimerRef = useRef(0);
  const siteVisible = introState === 'exiting' || introState === 'entered';
  useTextReveal(siteVisible);

  useEffect(() => {
    if (!siteVisible) return;
    const footer = document.querySelector('.landing-footer');
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Fast scrolls can reach the placeholder before the letter chunk arrives.
        const reachedEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
        setLoadInvitation(true);
        if (reachedEnd) setInvitationOpen(true);
        observer.disconnect();
      }
    }, { rootMargin: '1200px 0px' });
    observer.observe(footer);
    return () => observer.disconnect();
  }, [siteVisible]);

  useEffect(() => () => {
    clearTimeout(revealTimerRef.current);
    clearTimeout(wardTimerRef.current);
    soundContextRef.current?.close();
  }, []);

  const getSoundContext = () => {
    if (!isMusicPlaying) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = soundContextRef.current || (soundContextRef.current = new AudioCtx());
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };

  // Background Theme Music Setup
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.45;
      audio.loop = true;
    }
  }, []);

  const handleEnterCastle = () => {
    // 1. Play background music
    const audio = audioRef.current;
    if (audio) {
      audio.play().then(() => setIsMusicPlaying(true)).catch((e) => console.log('Audio autoplay prevented:', e));
    }

    // 2. Play Web Audio wand chime
    playParchmentSound();

    setIntroVideoUrl('/video/hexwartz-intro.mp4');
    setIntroState('buffering');
    startIntroPlayback();
  };

  const startIntroPlayback = () => {
    const video = introVideoRef.current;
    if (!video || !introVideoUrl || revealTimerRef.current || video.readyState < 2) return;
    setIntroState('playing');
    video.play().catch(() => triggerSiteReveal());
  };

  const triggerSiteReveal = () => {
    if (revealTimerRef.current) return;
    setIntroFading(true);
    setIntroState('exiting');
    revealTimerRef.current = setTimeout(() => {
      introVideoRef.current?.pause();
      setIntroState('entered');
    }, 1200); // 1.2s luxurious cinematic crossfade
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsMusicPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      soundContextRef.current?.suspend().catch(() => {});
      setIsMusicPlaying(false);
    }
  };

  const playParchmentSound = () => {
    try {
      const ctx = getSoundContext();
      if (ctx) {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
      }
    } catch (e) {
      // Audio fallback
    }
  };

  const probeVaultWards = () => {
    try {
      const ctx = getSoundContext();
      if (ctx) {
        const now = ctx.currentTime;
        // Deep resonant ward rumble
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.7);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };

        // Arcane celestial harmonics
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const chimeOsc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(freq, now + 0.12 + idx * 0.08);
          chimeGain.gain.setValueAtTime(0, now + 0.12 + idx * 0.08);
          chimeGain.gain.linearRampToValueAtTime(0.05, now + 0.15 + idx * 0.08);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1 + idx * 0.08);
          chimeOsc.connect(chimeGain);
          chimeGain.connect(ctx.destination);
          chimeOsc.start(now + 0.12 + idx * 0.08);
          chimeOsc.stop(now + 1.15 + idx * 0.08);
          chimeOsc.onended = () => { chimeOsc.disconnect(); chimeGain.disconnect(); };
        });
      }
    } catch (e) {
      console.warn('Ward audio error:', e);
    }
    setWardResonating(true);
    clearTimeout(wardTimerRef.current);
    wardTimerRef.current = setTimeout(() => setWardResonating(false), 2400);
  };

  const handleCardTilt = (e) => {
    const card = e.currentTarget;
    if (!card._cardRect) {
      card._cardRect = card.getBoundingClientRect();
    }
    const rect = card._cardRect;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
  };

  const handleCardTiltReset = (e) => {
    const card = e.currentTarget;
    card.style.transform = '';
    card._cardRect = null;
  };

  useEffect(() => {
    const sections = document.querySelectorAll('.landing-hero, .landing-section');
    // Offscreen SVG stroke and glow animations were still causing layout and paint every frame.
    if (!siteVisible) {
      sections.forEach(section => section.classList.add('animations-paused'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('animations-paused', !entry.isIntersecting));
    }, { rootMargin: '200px 0px' });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [siteVisible]);

  return (
    <div className={`site-wrapper landing-page ${introState !== 'entered' ? 'intro-active' : ''}`}>
      
      {/* =========================================================================
          CINEMATIC INTRO STARTING SCREEN (VIDEO & PARCHMENT ENTER BUTTON)
          ========================================================================= */}
      {introState !== 'entered' && (
        <div className={`cinematic-intro-overlay ${introFading ? 'intro-fade-out' : ''}`}>
          
          {/* Background Video */}
          <video
            ref={introVideoRef}
            className="intro-video-element"
            src={introVideoUrl}
            poster="/assets/optimized/intro-poster.webp"
            preload={introState === 'initial' ? 'none' : 'auto'}
            muted
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            onLoadedData={() => { if (introState === 'buffering') startIntroPlayback(); }}
            onEnded={triggerSiteReveal}
            onError={triggerSiteReveal}
          />

          {/* Starting Screen UI with ENTER Button positioned right under the Title */}
          {(introState === 'initial' || introState === 'buffering') && (
            <div className="intro-ui-container">
              
              {/* Skip / Direct Entry quick badge */}
              <button 
                type="button" 
                className="intro-skip-btn font-arcane" 
                onClick={triggerSiteReveal}
                aria-label="Skip cinematic prologue"
              >
                <span>SKIP INTRO</span>
                <ChevronRight size={13} />
              </button>

              {/* Centered Button Anchor aligned below the video's HexWartz Hackathon title */}
              <div className="intro-enter-slot">
                
                {/* Ornate Wizarding Parchment Plaque Button */}
                <button
                  type="button"
                  className="intro-parchment-enter-btn"
                  onClick={handleEnterCastle}
                  aria-label="Enter HexWartz Hackathon"
                  disabled={introState === 'buffering'}
                  aria-busy={introState === 'buffering'}
                >
                  <img
                    src="/assets/intro/enter-button-transparent.webp"
                    alt=""
                    aria-hidden="true"
                    className="parchment-plaque-img"
                    width="720"
                    height="240"
                  />
                </button>

                {/* Subtitle prompt */}
                <p className="intro-prompt-sub font-arcane" role="status">
                  {introState === 'buffering' ? 'PREPARING YOUR CINEMATIC ENTRANCE…' : 'TAP TO AWAKEN THE WARDS & ENTER PLATFORM 9¾'}
                </p>

              </div>

            </div>
          )}

          {/* Transition Starlight Flash when zooming into the portal */}
          {introState === 'playing' && (
            <div className="intro-zoom-active-indicator">
              <button 
                type="button" 
                className="intro-skip-btn font-arcane" 
                onClick={triggerSiteReveal}
                aria-label="Skip to castle"
              >
                <span>ENTER NOW</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}

        </div>
      )}

      {siteVisible && <>
      <EnchantedAtmosphere enabled={siteVisible} />


      <FloatingHeader registrationUrl={UNSTOP_URL} isMusicPlaying={isMusicPlaying} onToggleMusic={toggleMusic} />

      <main id="home">
        <section className="landing-hero" aria-labelledby="hero-title">
          <div className="landing-hero-glow" aria-hidden="true" />
          <div className="landing-hero-inner">
            <div className="landing-hero-copy">
              <div className="hero-brand-lockup">
                <img
                  className="hero-character-art"
                  src="/assets/v2/harry-hero.webp"
                  alt="Harry Potter with Hedwig"
                  fetchpriority="high"
                />
                <div className="hero-titles-wrap">
                  <div className="hero-title-main">HEXWARTZ</div>
                  <div className="hero-title-sub">
                    <span className="hero-title-hack">HACK</span>
                    <div className="hero-title-year">
                      <span>20</span>
                      <span>26</span>
                    </div>
                  </div>
                </div>
              </div>

              <h1 className="hero-tagline-arcane" id="hero-title">
                <span className="sr-only">EMBRACING ARCANE CODE</span>
                <img
                  className="hero-tagline-svg"
                  src="/assets/v2/embracing-arcane-code.svg"
                  alt="EMBRACING ARCANE CODE"
                  fetchpriority="high"
                />
              </h1>

              <p className="hero-arcane-desc">
                24 hours. Four houses. One idea worth building.
              </p>

              <div className="hero-date-badge">
                <Clock size={18} className="hero-badge-icon" />
                <span>13-14 NOVEMBER 2026 • AGRA</span>
              </div>

              <div className="hero-feature-pills">
                <div className="hero-pill">
                  <Award size={15} className="hero-pill-icon" />
                  <span>₹50,000+ PRIZES</span>
                </div>
                <div className="hero-pill">
                  <Zap size={15} className="hero-pill-icon" />
                  <span>24-HOUR BUILD</span>
                </div>
              </div>

              <div className="hero-action-row">
                <a
                  className="hero-btn-primary"
                  href={UNSTOP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Register on Unstop"
                >
                  <span>REGISTER ON UNSTOP</span>
                  <ArrowUpRight size={18} strokeWidth={2.8} />
                </a>

                <a
                  className="hero-btn-secondary"
                  href={GUIDELINES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official Tournament Guidelines PDF"
                >
                  <BookOpen size={16} />
                  <span>GUIDELINE BOOK (PDF)</span>
                </a>
              </div>
              <div className="hero-community-actions">
                <a className="contact-action contact-action-whatsapp" href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} aria-hidden="true" /> Join WhatsApp Group <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <a className="contact-action" href="#contact">
                  <Phone size={16} aria-hidden="true" /> Contact Us
                </a>
              </div>
            </div>

            <div className="landing-hero-art-wrap">
              <img
                className="hero-floating-candles"
                src="/assets/v2/great-hall-candles.webp"
                alt=""
                aria-hidden="true"
                width="256"
                height="384"
                decoding="async"
              />
              <div className="landing-art-frame">
                <img
                  className="landing-hero-art"
                  src="/assets/optimized/hero-owl.webp"
                  srcSet="/assets/optimized/hero-owl-small.webp 560w, /assets/optimized/hero-owl.webp 960w"
                  sizes="(max-width: 900px) 58vw, 42vw"
                  width="960"
                  height="960"
                  alt="HexWartz crest with a moonlit castle, owl, and spellbook"
                  fetchpriority="high"
                />
              </div>
              <div className="prize-callout">
                <div className="prize-callout-label">PRIZE POOL</div>
                <div className="prize-callout-val">
                  <Trophy size={28} className="prize-trophy-icon" />
                  <strong>₹50,000+</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="landing-hero-bottomline"><span>HEXWARTZ 2026</span><span>FOUR HOUSES · ONE GRAND CHALLENGE</span><span>SCROLL TO EXPLORE ↓</span></div>
        </section>

        <CinematicJourney enabled={siteVisible} />

        <section className="landing-section challenge-section" id="challenge" aria-labelledby="challenge-title">
          <div className="house-hall-backdrop" aria-hidden="true"><img src="/assets/scenes/great-hall.webp" alt="" loading="lazy" decoding="async" /></div>
          <div className="landing-section-head has-section-cutout">
            <img className="section-cutout" src="/assets/cutouts/sorting-hat.webp" alt="" aria-hidden="true" width="384" height="384" loading="lazy" decoding="async" />
            <p className="section-kicker section-kicker-sparkles">
              <Sparkles size={15} className="kicker-sparkle" />
              <span>FOUR HOUSES · FOUR CHALLENGE TRACKS</span>
              <Sparkles size={15} className="kicker-sparkle" />
            </p>
            <h2 id="challenge-title" className="section-title-3d">
              <span className="title-3d-gold">CHOOSE YOUR</span>{' '}
              <span className="title-3d-white">HOUSE</span>
            </h2>
            <p className="section-desc-3d">
              Find your frontier. Let your house banner lead the way.
            </p>
          </div>
          <div className="house-track-grid" id="houses">
            {HOUSE_TRACKS.map(({ house, track, mark, tone, gem, trait, banner, desc }) => (
              <article className={`house-track-card tone-${tone}`} key={house}>
                <div className="house-banner-wrap">
                  <img
                    src={banner}
                    alt={`${house} house banner`}
                    className="house-banner-img"
                    width="293"
                    height="440"
                    loading="lazy"
                  />
                </div>
                <div className="house-card-body">
                  <div className="house-card-header">
                    <span className="track-number">{mark}</span>
                    <div className="house-name-group">
                      <span className="track-house">{house}</span>
                      <span className="house-gem-badge">{gem}</span>
                    </div>
                  </div>
                  <h3 className="track-title">{track}</h3>
                  <span className="track-rule" />
                  <p className="track-desc">{desc}</p>
                  <div className="house-card-footer">
                    <span className="house-trait">{trait}</span>
                    <span className="house-action-pill">
                      Track {mark} <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section tournament-codex-section journey-section" id="journey" aria-labelledby="codex-title">
          <div className="landing-section-head has-section-cutout">
            <img className="section-cutout section-cutout-book" src="/assets/cutouts/spellbook-quill.webp" alt="" aria-hidden="true" width="384" height="384" loading="lazy" decoding="async" />
            <div className="section-kicker-sparkles">
              <Sparkles size={14} className="kicker-sparkle" />
              <span>YOUR QUEST AT A GLANCE</span>
              <Sparkles size={14} className="kicker-sparkle" />
            </div>
            <h2 id="codex-title" className="section-title-3d">
              <span className="title-3d-gold">TOURNAMENT</span>{' '}
              <span className="title-3d-white">CODEX</span>
            </h2>
            <p className="section-desc-3d">
              The team, the challenge, and everything included.
            </p>
          </div>

          <div className="codex-container">
            {/* 4 Sleek Telemetry Capsules */}
            <div className="codex-pills-bar">
              <div className="codex-pill-item">
                <div className="codex-pill-icon">
                  <Users size={18} />
                </div>
                <div className="codex-pill-info">
                  <span className="codex-pill-label">THE FELLOWSHIP</span>
                  <span className="codex-pill-val">4–6 WIZARDS</span>
                  <span className="codex-pill-sub">Minimum 4 members required</span>
                </div>
              </div>

              <div className="codex-pill-item">
                <div className="codex-pill-icon">
                  <CalendarDays size={18} />
                </div>
                <div className="codex-pill-info">
                  <span className="codex-pill-label">CRUCIBLE DATES</span>
                  <span className="codex-pill-val">13–14 NOV 2026</span>
                  <span className="codex-pill-sub">24-Hour on-campus build</span>
                </div>
              </div>

              <div className="codex-pill-item">
                <div className="codex-pill-icon">
                  <MapPin size={18} />
                </div>
                <div className="codex-pill-info">
                  <span className="codex-pill-label">SANCTUARY VENUE</span>
                  <span className="codex-pill-val">SHARDA UNIVERSITY AGRA</span>
                  <span className="codex-pill-sub">Full campus accommodation</span>
                </div>
              </div>

              <div className="codex-pill-item">
                <div className="codex-pill-icon">
                  <Award size={18} />
                </div>
                <div className="codex-pill-info">
                  <span className="codex-pill-label">REGISTRATION</span>
                  <span className="codex-pill-val">₹250 / MEMBER</span>
                  <span className="codex-pill-sub">Entry fee per participant</span>
                </div>
              </div>
            </div>

            {/* 3 Master Directives Panels */}
            <div className="codex-grid">
              {/* Panel 1: Eligibility & Fellowship */}
              <div 
                className="codex-card"
                onMouseMove={handleCardTilt}
                onMouseLeave={handleCardTiltReset}
              >
                <div className="codex-card-corner-tl" aria-hidden="true" />
                <div className="codex-card-corner-br" aria-hidden="true" />
                
                <div className="codex-card-header">
                  <div className="codex-card-meta">
                    <span className="codex-directive-badge">DIRECTIVE 01</span>
                    <span className="codex-num">§ 01</span>
                  </div>
                  <h3 className="codex-card-title">ADMISSION & ELIGIBILITY</h3>
                  <p className="codex-card-tagline">Gather your fellowship.</p>
                </div>

                <ul className="codex-list">
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>4–6 members.</strong> Minimum 4 students per team.
                    </div>
                  </li>
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>Mix your strengths.</strong> Cross-college and cross-discipline teams welcome.
                    </div>
                  </li>
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>Students welcome.</strong> Undergraduate and postgraduate.
                    </div>
                  </li>
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>Bring your student ID</strong> for campus entry.
                    </div>
                  </li>
                </ul>

                <div className="codex-card-footer">
                  <span className="codex-footer-badge">₹250 per member</span>
                  <span className="codex-footer-note">Beginners & Veterans</span>
                </div>
              </div>

              {/* Panel 2: The Two Trials */}
              <div 
                className="codex-card"
                onMouseMove={handleCardTilt}
                onMouseLeave={handleCardTiltReset}
              >
                <div className="codex-card-corner-tl" aria-hidden="true" />
                <div className="codex-card-corner-br" aria-hidden="true" />

                <div className="codex-card-header">
                  <div className="codex-card-meta">
                    <span className="codex-directive-badge">DIRECTIVE 02</span>
                    <span className="codex-num">§ 02</span>
                  </div>
                  <h3 className="codex-card-title">THE TWO TRIALS</h3>
                  <p className="codex-card-tagline">Pitch. Build. Present.</p>
                </div>

                <ul className="codex-list">
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>01 · Pitch online.</strong> Submit 5–8 slides on Unstop: idea, stack, and impact.
                    </div>
                  </li>
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>Idea first.</strong> No prototype needed for Round 1.
                    </div>
                  </li>
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>02 · Build on campus.</strong> 24 hours at Sharda University Agra, 13–14 November.
                    </div>
                  </li>
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>Show your work.</strong> 3-minute demo + 2-minute Q&A.
                    </div>
                  </li>
                </ul>

                <div className="codex-card-footer">
                  <span className="codex-footer-badge">✓ 13–14 Nov 2026</span>
                  <span className="codex-footer-note">Unstop Evaluation</span>
                </div>
              </div>

              {/* Panel 3: Castle Hospitality & Spoils */}
              <div 
                className="codex-card"
                onMouseMove={handleCardTilt}
                onMouseLeave={handleCardTiltReset}
              >
                <div className="codex-card-corner-tl" aria-hidden="true" />
                <div className="codex-card-corner-br" aria-hidden="true" />

                <div className="codex-card-header">
                  <div className="codex-card-meta">
                    <span className="codex-directive-badge">DIRECTIVE 03</span>
                    <span className="codex-num">§ 03</span>
                  </div>
                  <h3 className="codex-card-title">PROVISIONS & SPOILS</h3>
                  <p className="codex-card-tagline">Focus on the build. We cover the essentials.</p>
                </div>

                <ul className="codex-list">
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>Stay fuelled.</strong> Meals, snacks, tea, and coffee.
                    </div>
                  </li>
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>Stay connected.</strong> Wi-Fi, Ethernet, and power at your desk.
                    </div>
                  </li>
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>Rest on campus.</strong> Separate dorms with campus security.
                    </div>
                  </li>
                  <li className="codex-list-item">
                    <span className="codex-bullet-pip">✦</span>
                    <div>
                      <strong>₹50,000+ prize pool.</strong> Trophies, merch, and certificates.
                    </div>
                  </li>
                </ul>

                <div className="codex-card-footer">
                  <span className="codex-footer-badge">✓ Meals & Stay Included</span>
                  <span className="codex-footer-note">Cash + Perks</span>
                </div>
              </div>
            </div>

            {/* Bottom Action Ribbon */}
            <div className="codex-action-strip">
              <div className="codex-strip-left">
                <div className="codex-strip-icon-box">
                  <Sparkles size={20} className="kicker-sparkle" />
                </div>
                <div className="codex-strip-text">
                  <span className="codex-strip-heading">YOUR FELLOWSHIP STARTS HERE</span>
                  <span className="codex-strip-sub">4–6 members · ₹250 per member · 24 hours</span>
                </div>
              </div>

              <div className="codex-strip-actions">
                <a 
                  href={UNSTOP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="codex-btn-primary"
                  aria-label="Register on Unstop"
                >
                  <span>REGISTER ON UNSTOP</span>
                  <ArrowUpRight size={16} />
                </a>
                <a 
                  href={GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="codex-btn-tertiary"
                  aria-label="Direct Google Form Entry"
                >
                  <Scroll size={15} />
                  <span>GOOGLE FORM</span>
                  <ArrowUpRight size={14} />
                </a>
                <a 
                  href={GUIDELINES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="codex-btn-secondary"
                  aria-label="Download Official Guidelines PDF"
                >
                  <BookOpen size={15} />
                  <span>GUIDELINE BOOK (PDF)</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION: THE TRIWIZARD TREASURES · VAULT SEAL (CLEAN & MINIMALIST)
            ========================================================================= */}
        <section className="landing-section prizes-section" id="prizes" aria-labelledby="prizes-title">
          <div className="prizes-container">
            
            {/* Clean Section Head */}
            <div className="landing-section-head has-section-cutout">
              <img className="section-cutout section-cutout-trophy" src="/assets/cutouts/tournament-goblet.webp" alt="" aria-hidden="true" width="384" height="384" loading="lazy" decoding="async" />
              <div className="section-kicker-sparkles">
                <Sparkles size={14} className="kicker-sparkle" />
                <span>MINISTRY OF MAGIC · HIGH-SECURITY ARCHIVES</span>
                <Sparkles size={14} className="kicker-sparkle" />
              </div>
              <h2 id="prizes-title" className="section-title-3d">
                <span className="title-3d-gold">TRIWIZARD</span>{' '}
                <span className="title-3d-white">TREASURES</span>
              </h2>
              <p className="section-desc-3d">
                The vault is sealed. The full rewards reveal is coming soon.
              </p>
            </div>

            {/* Clean, Majestic Vault Safe with Proper Lock */}
            <div className={`clean-vault-card ${wardResonating ? 'wards-pulsing' : ''}`}>
              
              {/* Subtle Ambient Radial Leylines */}
              <div className="clean-vault-radial-glow" aria-hidden="true" />

              {/* The Proper Master Lock (Clean, Bold, SVG & CSS Crafted) */}
              <div 
                className="proper-master-lock-container"
                onClick={probeVaultWards}
                role="button"
                tabIndex={0}
                aria-label="Probe the enchanted vault seal"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') probeVaultWards(); }}
              >
                {/* Runic Arc Ring Halo */}
                <div className="proper-lock-ring" aria-hidden="true">
                  <svg viewBox="0 0 200 200" className="proper-lock-ring-svg">
                    <circle cx="100" cy="100" r="90" className="ring-track" />
                    <circle cx="100" cy="100" r="90" className="ring-pulse" />
                  </svg>
                </div>

                {/* Big, Crisp, Beautiful Padlock */}
                <div className="proper-padlock-graphic">
                  <div className="proper-shackle" />
                  <div className="proper-padlock-body">
                    <div className="proper-padlock-face">
                      <Lock size={44} strokeWidth={2.4} className="proper-lock-svg-icon" />
                      <div className="proper-keyhole-notch" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Coming Soon Tag */}
              <div className="proper-coming-soon-badge">
                <Sparkles size={13} />
                <span>BOUNTY VAULT SEALED · COMING SOON</span>
                <Sparkles size={13} />
              </div>

              <h3 className="proper-vault-status-title">
                REWARD STRUCTURE REVEALING SOON
              </h3>

              <p className="proper-vault-status-desc">
                Cash prizes. House honours. A place in HexWartz history.
              </p>

              {/* Clean 3-Item Teaser Bar */}
              <div className="proper-teaser-bar">
                <div className="proper-teaser-pill">
                  <Trophy size={15} className="teaser-pill-icon" />
                  <span>Grand Champion Trophy</span>
                </div>
                <div className="proper-teaser-pill">
                  <Award size={15} className="teaser-pill-icon" />
                  <span>Order of Merlin Laurels</span>
                </div>
                <div className="proper-teaser-pill">
                  <Zap size={15} className="teaser-pill-icon" />
                  <span>4 House Track Bounties</span>
                </div>
              </div>

              {/* Interactive Probe Button */}
              <button 
                type="button" 
                className={`proper-probe-btn ${wardResonating ? 'is-resonating' : ''}`}
                onClick={probeVaultWards}
                aria-label="Tap to probe the enchanted vault lock"
              >
                <ShieldAlert size={16} />
                <span>{wardResonating ? '⚡ UNBREAKABLE VOW ACTIVE · ACCESS RESTRICTED' : 'TAP TO PROBE VAULT WARDS'}</span>
              </button>

            </div>

          </div>
        </section>

        <section className="landing-section daily-prophet-section registration-section" id="registration" aria-labelledby="prophet-title">
          <div id="prophet" style={{ position: 'relative', top: '-80px', visibility: 'hidden' }} />
          <div className="daily-prophet-container">
            <div className="daily-prophet-broadsheet">
              
              {/* Ornate Newspaper Masthead */}
              <div className="prophet-masthead">
                <div className="prophet-issue-row">
                  <span>SPECIAL TOURNAMENT EDITION</span>
                  <span>PRICE: 1 KNUT</span>
                  <span>ISSUE NO. 777</span>
                  <span>SHARDA UNIVERSITY AGRA</span>
                </div>
                <h2 id="prophet-title" className="prophet-logo-text">THE DAILY PROPHET</h2>
                <div className="prophet-sub-bar">
                  <span>MINISTRY GAZETTE</span>
                  <span>WEATHER: 24°C · HIGH CREATIVITY WINDS</span>
                  <span>HOUSE ODDS: GRYFFINDOR 2-1 · SLYTHERIN 5-2</span>
                  <span>CIRCULATION: 50,000</span>
                </div>
              </div>

              {/* Newspaper Content Layout */}
              <div className="daily-prophet-layout">
                
                {/* Left: Bewitched Moving Picture Frame */}
                <div className="prophet-moving-photo-frame">
                  <div className="prophet-photo-badge">
                    <Sparkles size={12} />
                    <span>LIVING PHOTOGRAPH</span>
                  </div>
                  <div className="moving-photo-inner">
                    <img 
                      src="/assets/sprites/harry_hedwig.webp"
                      alt="Bewitched moving photograph of Harry Potter and Hedwig" 
                      className="prophet-moving-photo"
                      loading="lazy"
                    />
                    <div className="moving-photo-halftone" aria-hidden="true" />
                    <div className="moving-photo-scanline" aria-hidden="true" />
                  </div>
                  <div className="prophet-photo-caption">
                    The owl post is open. Your invitation awaits.
                  </div>
                </div>

                {/* Right: Lead Article & Interactive Audio Quote */}
                <div className="prophet-article-body">
                  <div className="prophet-dispatch-badge">
                    <Scroll size={14} />
                    <span>OFFICIAL MINISTRY DISPATCH · NOVEMBER 2026</span>
                  </div>

                  <h3 className="prophet-headline">
                    FOUR HOUSES. ONE UNFORGETTABLE BUILD.
                  </h3>

                  <div className="prophet-columns-dual">
                    <p className="prophet-para">
                      13–14 November 2026. Sharda University Agra. Build with your fellowship across AI, healthcare, sustainability, or open innovation.
                    </p>
                    <p className="prophet-para">
                      Arrive with an idea. Leave with a working prototype, new connections, and a story to tell.
                    </p>
                  </div>

                  {/* Official Proclamation Quote */}
                  <blockquote className="prophet-quote-box">
                    <p className="prophet-quote-text">
                      “The magic is in what you make.”
                    </p>
                    <cite className="prophet-quote-author">
                      — The Official HexWartz Proclamation
                    </cite>
                  </blockquote>

                  {/* Admissions & Logistics Gazette Ticker */}
                  <div className="prophet-admissions-ticker">
                    <div className="admissions-pill">
                      <span className="admissions-pill-tag">TEAM SIZE</span>
                      <strong className="admissions-pill-val">4–6 <small>members</small></strong>
                      <span className="admissions-pill-note">Minimum 4 members required</span>
                    </div>
                    <div className="admissions-pill">
                      <span className="admissions-pill-tag">ENTRY FEE</span>
                      <strong className="admissions-pill-val">₹250 <small>/ member</small></strong>
                      <span className="admissions-pill-note">24H Stay, Meals & Kit Included</span>
                    </div>
                    <div className="admissions-pill">
                      <span className="admissions-pill-tag">PRIZE POOL</span>
                      <strong className="admissions-pill-val">₹50,000+</strong>
                      <span className="admissions-pill-note">Cash & House Cup Glory</span>
                    </div>
                  </div>

                  {/* Interactive Action Strip */}
                  <div className="prophet-action-strip">
                    <a 
                      href={UNSTOP_URL}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="prophet-btn-gold"
                    >
                      <span>REGISTER ON UNSTOP</span>
                      <ArrowUpRight size={15} />
                    </a>

                    <a 
                      href={GOOGLE_FORM_URL}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="prophet-btn-form"
                    >
                      <Scroll size={15} />
                      <span>GOOGLE FORM ENTRY</span>
                      <ArrowUpRight size={15} />
                    </a>

                    <a 
                      href={GUIDELINES_URL}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="prophet-btn-secondary"
                    >
                      <BookOpen size={15} />
                      <span>OFFICIAL GUIDELINES (PDF)</span>
                      <ArrowUpRight size={15} />
                    </a>


                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION: THE RESTRICTED SECTION · ENCHANTED FAQ
            ========================================================================= */}
        <section className="landing-section faq-section" id="faq" aria-labelledby="faq-title">
          <div className="faq-container">
            
            {/* Unified Section Head */}
            <div className="landing-section-head">
              <div className="section-kicker-sparkles">
                <BookOpen size={14} className="kicker-sparkle" />
                <span>BEFORE YOU ENTER THE GREAT HALL</span>
                <BookOpen size={14} className="kicker-sparkle" />
              </div>
              <h2 id="faq-title" className="section-title-3d">
                <span className="title-3d-gold">THE ESSENTIALS</span>{' '}
                <span className="title-3d-white">FAQ</span>
              </h2>
              <p className="section-desc-3d">
                A few answers before your adventure.
              </p>
            </div>

            {/* Accordion List */}
            <div className="faq-list">
              {FAQ_DATA.map((faq, idx) => {
                const isOpen = expandedFaq === idx;

                return (
                  <div 
                    key={idx} 
                    className={`faq-card ${isOpen ? 'open' : ''}`}
                  >
                    <button 
                      type="button"
                      className="faq-question-btn"
                      onClick={() => {
                        playParchmentSound();
                        setExpandedFaq(isOpen ? null : idx);
                      }}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-question-left">
                        <Scroll size={19} className="faq-scroll-icon" />
                        <span className="faq-question-text">{faq.q}</span>
                      </span>
                      <span className="faq-chevron-wrap">
                        {isOpen ? (
                          <ChevronUp size={20} className="faq-chevron" />
                        ) : (
                          <ChevronDown size={20} className="faq-chevron" />
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="faq-answer-pane">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>
        <section className="landing-section contact-section" id="contact" aria-labelledby="contact-title">
          <div className="contact-container">
            <div className="landing-section-head">
              <div className="section-kicker-sparkles">
                <Sparkles size={14} className="kicker-sparkle" aria-hidden="true" />
                <span>THE OWL POST</span>
                <Sparkles size={14} className="kicker-sparkle" aria-hidden="true" />
              </div>
              <h2 id="contact-title" className="section-title-3d">
                <span className="title-3d-gold">CONTACT</span>{' '}
                <span className="title-3d-white">US</span>
              </h2>
              <p className="section-desc-3d">A question about your quest? Reach out.</p>
            </div>
            <div className="contact-grid">
              <article className="contact-card">
                <div className="contact-icon" aria-hidden="true"><Phone size={26} /></div>
                <p className="contact-eyebrow">SEND AN OWL TO</p>
                <h3>Vishal Hotwani</h3>
                <a className="contact-number" href="tel:+917535040006">7535040006</a>
                <p>Registration & event queries.</p>
                <a className="contact-action" href="tel:+917535040006"><Phone size={17} aria-hidden="true" /> Call Vishal</a>
              </article>
              <article className="contact-card">
                <div className="contact-icon" aria-hidden="true"><Phone size={26} /></div>
                <p className="contact-eyebrow">SEND AN OWL TO</p>
                <h3>Yash Agarwal</h3>
                <a className="contact-number" href="tel:+919411664116">9411664116</a>
                <p>Teams & tournament queries.</p>
                <a className="contact-action" href="tel:+919411664116"><Phone size={17} aria-hidden="true" /> Call Yash</a>
              </article>
              <article className="contact-card contact-card-community">
                <div className="contact-icon" aria-hidden="true"><MessageCircle size={28} /></div>
                <p className="contact-eyebrow">GATHER YOUR FELLOWSHIP</p>
                <h3>Join the WhatsApp Group</h3>
                <p>Meet the builders. Follow the updates.</p>
                <a className="contact-action contact-action-whatsapp" href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} aria-hidden="true" /> Join WhatsApp Group <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <a className="landing-brand" href="#home" aria-label="HexWartz home">
          <img
            src="/assets/branding/hexwartz_crest_nav.webp"
            alt="HexWartz Crest"
            className="landing-brand-crest"
            width="42"
            height="42"
            loading="lazy"
            decoding="async"
          />
          <div className="landing-brand-text">
            <span className="landing-brand-name">HexWartz</span>
            <span className="landing-brand-sub">Sharda University Agra</span>
          </div>
        </a>
        
        <div className="footer-links-row">
          <a href={UNSTOP_URL} target="_blank" rel="noopener noreferrer">Unstop Portal <ArrowUpRight size={13} /></a>
          <span className="footer-links-divider">·</span>
          <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">Google Form Portal <ArrowUpRight size={13} /></a>
          <span className="footer-links-divider">·</span>
          <a href={GUIDELINES_URL} target="_blank" rel="noopener noreferrer">Official Guidelines (PDF) <ArrowUpRight size={13} /></a>
          <span className="footer-links-divider">·</span>
          <a href="#contact">Contact Us</a>
          <span className="footer-links-divider">·</span>
          <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer">WhatsApp Group <ArrowUpRight size={13} /></a>
        </div>

        <p>13–14 November 2026 <span>·</span> Anand School of Engineering and Technology</p>
        <a href="#home" className="back-to-top">Back to top ↑</a>
      </footer>

      {loadInvitation ? <Suspense fallback={<div className="letter-deferred-placeholder" />}><InvitationLetter
        isOpen={invitationOpen}
        onOpen={() => setInvitationOpen(true)}
        onClose={() => setInvitationOpen(false)}
        registrationUrl={UNSTOP_URL}
        whatsappUrl={WHATSAPP_GROUP_URL}
      /></Suspense> : <div className="letter-deferred-placeholder" aria-hidden="true" />}

      </>}

      {/* Background Audio Element */}
      <audio 
        ref={audioRef}
        src="/music/theme.mp3"
        preload="none"
        loop
      />

    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
