import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Download,
  Globe,
  Headphones,
  Heart,
  ListMusic,
  Music,
  Sparkles,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get personalized recommendations in seconds using advanced AI algorithms',
  },
  {
    icon: Music,
    title: 'Multi-Genre Support',
    description: 'Discover music across all genres from classical to electronic',
  },
  {
    icon: Heart,
    title: 'Smart Personalization',
    description: 'Learns your taste and improves recommendations over time',
  },
  {
    icon: BarChart3,
    title: 'Advanced Filters',
    description: 'Filter by mood, activity, language, and more',
  },
  {
    icon: Globe,
    title: 'Global Library',
    description: 'Access recommendations from artists around the world',
  },
];

const SERVICES = [
  {
    icon: Sparkles,
    title: 'Mood-Based Recommendations',
    description: 'Turn a feeling, genre, and activity into a ready-to-play set of songs with clear reasons for every pick.',
    detail: 'Best for daily listening, studying, working out, and winding down.',
  },
  {
    icon: ListMusic,
    title: 'Playlist Builder',
    description: 'Shape recommendations into focused playlists that match the exact moment instead of a generic chart.',
    detail: 'Includes summaries, song context, and repeatable prompts.',
  },
  {
    icon: Headphones,
    title: 'Listening Insights',
    description: 'See patterns in recent prompts so the app can help you refine your taste over time.',
    detail: 'Designed around moods, genres, activities, and languages.',
  },
  {
    icon: Download,
    title: 'Easy Playlist Export',
    description: 'Save or share recommendation sets after you find a mix that fits.',
    detail: 'Useful for keeping study, travel, party, or focus sessions organized.',
  },
];

export default function LandingPage({ onStartClick }) {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    setNewsletterStatus('Updates are coming soon. Thanks for your interest.');
    setEmail('');
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <nav className="navbar">
          <div className="navbar-brand">
            <Music className="logo-icon" />
            <span>MusicAI</span>
          </div>
          <div className="navbar-links">
            <a href="#features">Features</a>
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#faq">FAQ</a>
          </div>
          <button onClick={onStartClick} className="btn-start">Get Started</button>
        </nav>

        <div className="hero-content">
          <h1>Discover Music That Speaks to You</h1>
          <p>Experience the future of music discovery with AI-powered personalized recommendations tailored to your mood, activity, and taste.</p>
          
          <div className="hero-buttons">
            <button onClick={onStartClick} className="btn-primary">
              Start Discovering <ArrowRight size={18} />
            </button>
            <button className="btn-secondary">Watch Demo</button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Songs Curated</span>
            </div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Genres Supported</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Free Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>Why Choose MusicAI?</h2>
          <p>Powerful features designed for music lovers</p>
        </div>

        <div className="features-grid">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="feature-card">
                <div className="feature-icon">
                  <Icon size={28} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="section-header">
          <h2>Services Built Around Your Listening Moment</h2>
          <p>From a quick vibe check to a saved playlist, MusicAI keeps discovery practical.</p>
        </div>

        <div className="services-grid">
          {SERVICES.map((service, idx) => {
            const Icon = service.icon;
            return (
              <article key={idx} className="service-card">
                <div className="service-icon">
                  <Icon size={26} />
                </div>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <span>{service.detail}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to great music</p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Tell Us Your Mood</h3>
            <p>Select how you&apos;re feeling - happy, focused, relaxed, or any mood</p>
          </div>
          <div className="step-divider"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Choose Your Context</h3>
            <p>Pick your favorite genre and what you&apos;re doing right now</p>
          </div>
          <div className="step-divider"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Enjoy Recommendations</h3>
            <p>Get a curated playlist perfectly matched to your vibe</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Discover Your Next Favorite Song?</h2>
          <p>Join thousands of music enthusiasts finding their perfect soundtrack.</p>
          <button onClick={onStartClick} className="btn-primary btn-large">
            Start Discovering Now <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="newsletter-content">
          <h3>Stay Updated</h3>
          <p>Get tips on finding great music and updates about new features</p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">Subscribe</button>
          </form>
          {newsletterStatus && <p className="newsletter-status">{newsletterStatus}</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>MusicAI</h4>
            <p>AI-powered music discovery platform</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#terms">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 MusicAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
