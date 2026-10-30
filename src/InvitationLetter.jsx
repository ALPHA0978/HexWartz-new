import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Sparkles, X } from 'lucide-react';
import './invitation.css';

export default function InvitationLetter({ isOpen, onOpen, onClose, registrationUrl, whatsappUrl }) {
  const dialogRef = useRef(null);
  const endRef = useRef(null);
  const autoOpened = useRef(false);
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.7;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !autoOpened.current) {
        autoOpened.current = true;
        onOpen();
      }
    }, { threshold: 0.9 });
    observer.observe(endRef.current);
    return () => observer.disconnect();
  }, [onOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <>
      <section className="letter-finale" id="invitation" aria-labelledby="letter-finale-title">
        <p className="contact-eyebrow">ONE LAST DELIVERY FROM THE OWL POST</p>
        <h2 id="letter-finale-title">A little magic, addressed to you.</h2>
        <button className="letter-invitation-trigger" type="button" onClick={onOpen} aria-label="Open your HexWartz invitation letter">
          <img src="/assets/v2/Gemini_Generated_Image_5hr7u45hr7u45hr7-clean.webp" alt="A parchment envelope with a crimson wax seal" width="220" height="220" loading="lazy" />
          <span>Break the seal <ArrowUpRight size={16} aria-hidden="true" /></span>
        </button>
        <p className="letter-finale-note">Your next chapter is waiting.</p>
      </section>
      <div ref={endRef} className="letter-end-marker" aria-hidden="true" />

      <dialog ref={dialogRef} className="invitation-dialog" aria-labelledby="invitation-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
        <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
          {isOpen && (
            <motion.div className="invitation-presentation" key="invitation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.25 }}>
              <button type="button" className="invitation-close" onClick={onClose} aria-label="Close invitation letter" autoFocus><X size={20} /></button>
              <motion.div className="invitation-opening-envelope" aria-hidden="true"
                initial={{ opacity: 1, y: 50, scale: 0.88 }}
                animate={{ opacity: [1, 1, 0], y: [50, 50, 180], scale: [0.88, 1, 0.96] }}
                transition={{ duration: reduceMotion ? 0 : 1.45, times: [0, 0.65, 1] }}>
                <div className="invitation-envelope-back" />
                <motion.div className="invitation-envelope-flap" initial={{ rotateX: 0 }} animate={{ rotateX: -180 }} transition={{ duration, delay: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }} />
                <div className="invitation-envelope-front" />
                <motion.div className="invitation-wax-seal" initial={{ scale: 1, opacity: 1 }} animate={{ scale: 1.35, opacity: 0, rotate: -18 }} transition={{ duration: reduceMotion ? 0 : 0.35 }}>H</motion.div>
              </motion.div>
              <motion.article className="invitation-parchment"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 110, scale: reduceMotion ? 1 : 0.86, rotate: reduceMotion ? 0 : -2 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}>
                <div className="invitation-letterhead">
                  <img src="/assets/branding/hexwartz_crest_nav.webp" width="70" height="70" alt="HexWartz crest" />
                  <span>HEXWARTZ</span>
                  <small>SHARDA UNIVERSITY AGRA</small>
                </div>
                <div className="invitation-rule"><span>THE OWL POST</span><Sparkles size={16} aria-hidden="true" /><span>CLASS OF 2026</span></div>
                <p className="invitation-salutation">Dear maker of extraordinary things,</p>
                <h2 id="invitation-title">Your next chapter<br />begins at HexWartz.</h2>
                <p>Some letters carry news. This one carries a possibility.</p>
                <p>You are invited to bring your curiosity, courage, and brightest ideas to HexWartz. Gather your fellowship, choose your House, and turn a spark of imagination into something the world can use.</p>
                <p>On <strong>13–14 November 2026</strong>, the halls of <strong>Sharda University Agra</strong> await the builders who dare to begin. Your story belongs among them.</p>
                <p className="invitation-closing">The magic is in what you make.</p>
                <div className="invitation-signature">The HexWartz Guild<span>Four Houses. One extraordinary beginning.</span></div>
                <div className="invitation-actions">
                  <a href={registrationUrl} target="_blank" rel="noopener noreferrer">Begin your journey <ArrowUpRight size={16} aria-hidden="true" /></a>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Join the fellowship <ArrowUpRight size={16} aria-hidden="true" /></a>
                </div>
              </motion.article>
            </motion.div>
          )}
        </AnimatePresence>
      </dialog>
    </>
  );
}
