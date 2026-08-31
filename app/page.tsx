'use client';
import { useEffect, useState } from 'react';

const nav = ['Home', 'Artists', 'Book Talent', 'Venues & Promoters', 'Festivals & Events', 'About', 'Contact'];
const pillars = [
  ['Selective Roster', 'Focused attention for artists with real live potential.'],
  ['Strategic Booking', 'Placements built around routing, markets, and momentum.'],
  ['Buyer Relationships', 'Clear communication from first inquiry through show day.'],
  ['Career Development', 'Every opportunity should move the artist forward.'],
];
const slug = (label: string) => `#${label.toLowerCase().replaceAll(' & ', '-').replaceAll(' ', '-')}`;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', close); };
  }, [menuOpen]);

  return <main>
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <a className="brand" href="#home" aria-label="Semper Fi Booking and Entertainment home"><strong>SEMPER FI</strong><span>BOOKING &amp; ENTERTAINMENT</span></a>
      <nav className="desktop-nav" aria-label="Primary navigation">{nav.map(item => <a key={item} href={slug(item)}>{item}</a>)}</nav>
      <a className="button header-cta" href="#book-talent">Book Talent <span aria-hidden="true">→</span></a>
      <button className={`menu-button ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label="Toggle navigation"><span /><span /></button>
    </header>
    <div className={`menu-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />
    <nav id="mobile-menu" className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-label="Mobile navigation">{nav.map(item => <a key={item} href={slug(item)} onClick={() => setMenuOpen(false)}>{item}<span aria-hidden="true">→</span></a>)}</nav>

    <section id="home" className="hero">
      <div className="hero-shade" />
      <div className="hero-content">
        <p className="eyebrow">Semper Fi Booking &amp; Entertainment</p>
        <h1>Better Shows.<br />Bigger Opportunities.<br />Stronger Careers.</h1>
        <div className="gold-rule"><span>★</span></div>
        <p className="hero-copy">Boutique artist representation and strategic live entertainment. We connect carefully selected talent with rooms where the opportunity actually matters.</p>
        <div className="hero-actions"><a className="button button-primary" href="#book-talent">Book Talent <span aria-hidden="true">→</span></a><a className="button button-outline" href="#artists">View Artists <span aria-hidden="true">→</span></a></div>
      </div>
      <a className="scroll-cue" href="#who-we-are" aria-label="Continue to who we are"><span />Explore</a>
    </section>

    <section id="who-we-are" className="section philosophy">
      <div className="section-heading"><p className="eyebrow gold">Who We Are</p><h2>We don’t chase dates.<br className="mobile-only" /> We build careers.</h2><p>Semper Fi keeps the roster deliberately focused so every booking decision can be made with purpose.</p></div>
      <div className="pillar-grid">{pillars.map(([title, body], index) => <article className="pillar" key={title}><span className="pillar-number">0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>

    <section id="artists" className="section roster">
      <div className="roster-image" role="img" aria-label="Crowd at a live concert" />
      <div className="roster-copy"><p className="eyebrow gold">The Roster</p><h2>Curated talent.<br />Built for the stage.</h2><p>Artist profiles are being prepared. This space is ready for the real roster photography, bios, media, and booking links as they arrive.</p><a className="text-link" href="#contact">Ask about available talent <span aria-hidden="true">→</span></a></div>
    </section>

    <section id="book-talent" className="section booking"><p className="eyebrow gold">For Buyers</p><h2>Looking for the right artist for the room?</h2><p>Tell us what you’re booking. We’ll help match the opportunity with the right live talent.</p><div className="hero-actions centered"><a className="button button-primary" href="#contact">Start a Booking Inquiry <span aria-hidden="true">→</span></a><a className="button button-outline" href="#contact">Contact Semper Fi</a></div></section>
    <footer id="contact"><a className="brand" href="#home"><strong>SEMPER FI</strong><span>BOOKING &amp; ENTERTAINMENT</span></a><p>Better Shows. Bigger Opportunities. Stronger Careers.</p><p className="placeholder">Contact details and social links coming soon.</p></footer>
  </main>;
}
