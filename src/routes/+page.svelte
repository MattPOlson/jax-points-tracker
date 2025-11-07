<script>
  import { onMount } from 'svelte';
  import { Container } from '$lib/components/ui';

  let upcomingEvents = [];
  let loadingEvents = true;

  onMount(async () => {
    try {
      const response = await fetch('/api/calendar-events');
      if (response.ok) {
        upcomingEvents = await response.json();
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      loadingEvents = false;
    }
  });

  function formatEventDate(dateString) {
    const date = new Date(dateString);
    const options = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  }

  function formatEventDay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function formatEventTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
</script>

<div class="landing-page">
  <!-- Top Navigation -->
  <nav class="top-nav">
    <div class="nav-container">
      <div class="nav-logo">
        <img src="/logo.png" alt="JAX Logo" />
      </div>
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="https://calendar.google.com/calendar/embed?src=jaxaleexchange@gmail.com&ctz=America/New_York" target="_blank" rel="noopener noreferrer">Event Calendar</a>
        <a href="/portal">Members Portal</a>
        <a href="#about">About Us</a>
        <a href="/portal" class="nav-cta">Join/Login</a>
      </div>
      <button class="mobile-menu-btn" aria-label="Menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
  </nav>

  <!-- Hero Section with Events -->
  <section class="hero">
    <Container size="xl">
      <div class="hero-content">
        <div class="hero-left">
          <div class="logo-container">
            <img src="/logo.png" alt="Jacksonville Ale Exchange Logo" class="logo" />
          </div>
          <h1 class="tagline">Have Fun. Brew Better Beer.</h1>
          <p class="subtitle">Jacksonville's Premier Homebrew Club</p>
        </div>

        <!-- Upcoming Events in Hero -->
        <aside class="hero-events">
          <div class="events-box">
            <h2>Upcoming Events</h2>
            {#if loadingEvents}
              <div class="loading">Loading events...</div>
            {:else if upcomingEvents.length > 0}
              {#each upcomingEvents as event}
                <div class="event-card">
                  <div class="event-date">
                    <div class="event-day">{formatEventDay(event.start)}</div>
                    <div class="event-time">{formatEventTime(event.start)}</div>
                  </div>
                  <div class="event-details">
                    <h3>{event.title}</h3>
                    {#if event.location}
                      <p class="event-location">📍 {event.location}</p>
                    {/if}
                  </div>
                </div>
              {/each}
              <a href="https://calendar.google.com/calendar/embed?src=jaxaleexchange@gmail.com&ctz=America/New_York"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="view-calendar-link">
                View Full Calendar →
              </a>
            {:else}
              <p class="no-events">No upcoming events scheduled. Check back soon!</p>
            {/if}
          </div>

          <!-- Quick Links -->
          <div class="quick-links-box">
            <h3>Quick Links</h3>
            <a href="/portal" class="quick-link">
              <span class="link-icon">🍺</span>
              <span>Members Portal</span>
            </a>
            <a href="/portal" class="quick-link">
              <span class="link-icon">🏆</span>
              <span>Competitions</span>
            </a>
            <a href="/portal" class="quick-link">
              <span class="link-icon">📊</span>
              <span>Leaderboard</span>
            </a>
          </div>
        </aside>
      </div>
    </Container>
  </section>

  <!-- Main Content -->
  <Container size="xl">
    <div class="main-content">
      <!-- About Section -->
      <section class="about" id="about">
        <h2>About Us</h2>
        <div class="about-content">
          <p>
            Our club was founded on a simple yet powerful principle: <strong>Have fun and brew better beer</strong>.
            We believe that homebrewing is more than just a hobby—it's a community where creativity, camaraderie,
            and the love of great beer unite people from every walk of life. From beginners learning the basics to
            seasoned experts exploring advanced techniques, we work together through friendly competitions,
            collaborative feedback, and open knowledge-sharing to keep improving each other's brews.
          </p>
          <p>
            We love tasting and talking about all things beer—whether it's a fresh batch from one of our members
            or a commercial example that inspires our next recipe. Every gathering is an opportunity to learn,
            experiment, and celebrate the craft. Above all, we aim to create a fun, supportive environment where
            every member feels encouraged to share ideas and push their brewing to the next level.
          </p>
          <p>
            Looking ahead, we plan to become a premier homebrewing club in Florida by fostering a welcoming spirit
            and participating in competitions at every level. Our vision is to secure the title of
            <strong>Florida's #1 Homebrew Club by 2026</strong>, not just through awards, but by expanding our membership,
            deepening our collective expertise, and staying true to our founding mission: have fun and brew better beer.
            We'd love for you to join us on this exciting journey. Cheers!
          </p>
        </div>

        <!-- CTA Buttons -->
        <div class="cta-buttons">
          <a href="/portal" class="cta-btn primary">Join the Club</a>
          <a href="https://calendar.google.com/calendar/embed?src=jaxaleexchange@gmail.com&ctz=America/New_York"
             target="_blank"
             rel="noopener noreferrer"
             class="cta-btn secondary">View Events</a>
        </div>
      </section>
    </div>
  </Container>

  <!-- Footer -->
  <footer class="landing-footer">
    <Container size="xl">
      <p>Jacksonville Ale Exchange Homebrew Club</p>
      <p class="footer-tagline">Brewing Excellence Since Day One</p>
    </Container>
  </footer>
</div>

<style>
  .landing-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #fef9f3 0%, #fff8ed 50%, #fef5e7 100%);
  }

  /* Top Navigation */
  .top-nav {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--space-6);
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
  }

  .nav-logo {
    display: flex;
    align-items: center;
  }

  .nav-logo img {
    height: 50px;
    width: auto;
  }

  .nav-links {
    display: flex;
    gap: var(--space-6);
    align-items: center;
  }

  .nav-links a {
    text-decoration: none;
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-base);
    transition: color 0.2s ease;
    white-space: nowrap;
  }

  .nav-links a:hover {
    color: var(--color-brand-primary);
  }

  .nav-cta {
    background: linear-gradient(135deg, #d4a373 0%, #c19a6b 100%);
    color: white !important;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(212, 163, 115, 0.3);
  }

  .nav-cta:hover {
    background: linear-gradient(135deg, #c19a6b 0%, #b8935a 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 163, 115, 0.4);
  }

  .mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-primary);
  }

  /* Hero Section */
  .hero {
    background: linear-gradient(135deg, #fff8ed 0%, #fef3e2 50%, #fff8ed 100%);
    padding: var(--space-8) 0;
    position: relative;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -10%;
    width: 40%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 200, 87, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero::after {
    content: '';
    position: absolute;
    bottom: -50%;
    right: -10%;
    width: 40%;
    height: 200%;
    background: radial-gradient(circle, rgba(212, 163, 115, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-content {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: var(--space-8);
    align-items: start;
    position: relative;
    z-index: 1;
  }

  .hero-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .logo-container {
    margin-bottom: var(--space-4);
    animation: fadeInUp 0.8s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .logo {
    max-width: 500px;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 12px 30px rgba(0, 0, 0, 0.15));
    transition: transform 0.3s ease;
  }

  .logo:hover {
    transform: scale(1.03);
  }

  .tagline {
    font-size: clamp(var(--font-size-xl), 4vw, var(--font-size-3xl));
    font-weight: var(--font-weight-bold);
    color: #2c1810;
    margin: 0 0 var(--space-2);
    letter-spacing: -0.02em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .subtitle {
    font-size: clamp(var(--font-size-base), 2vw, var(--font-size-lg));
    color: #8b6914;
    margin: 0;
    font-weight: var(--font-weight-medium);
  }

  /* Hero Events Section */
  .hero-events {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  /* Main Content */
  .main-content {
    padding: var(--space-8) 0;
  }

  .events-box,
  .quick-links-box {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    box-shadow: 0 4px 20px rgba(212, 163, 115, 0.15);
    border: 1px solid rgba(212, 163, 115, 0.1);
  }

  .events-box h2,
  .quick-links-box h3 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    background: linear-gradient(135deg, #d4a373 0%, #c19a6b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 var(--space-4);
  }

  .event-card {
    background: linear-gradient(135deg, #fff8ed 0%, #fef3e2 100%);
    border-left: 4px solid #d4a373;
    padding: var(--space-4);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
    box-shadow: 0 2px 8px rgba(212, 163, 115, 0.1);
    transition: all 0.3s ease;
  }

  .event-card:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(212, 163, 115, 0.2);
  }

  .event-date {
    font-weight: var(--font-weight-bold);
    color: #d4a373;
    margin-bottom: var(--space-2);
  }

  .event-day {
    font-size: var(--font-size-base);
    color: #8b6914;
  }

  .event-time {
    font-size: var(--font-size-sm);
    color: #a0826d;
  }

  .event-details h3 {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-1);
  }

  .event-location {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .view-calendar-link {
    display: inline-block;
    color: #d4a373;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-sm);
    text-decoration: none;
    margin-top: var(--space-2);
    transition: all 0.2s ease;
  }

  .view-calendar-link:hover {
    transform: translateX(4px);
    color: #c19a6b;
  }

  .loading,
  .no-events {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    padding: var(--space-4) 0;
  }

  /* Quick Links */
  .quick-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    transition: all 0.2s ease;
    margin-bottom: var(--space-2);
  }

  .quick-link:hover {
    background: var(--color-bg-secondary);
    transform: translateX(4px);
  }

  .link-icon {
    font-size: var(--font-size-xl);
  }

  /* About Section */
  .about {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    box-shadow: 0 4px 20px rgba(212, 163, 115, 0.15);
    border: 1px solid rgba(212, 163, 115, 0.1);
  }

  .about h2 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    background: linear-gradient(135deg, #d4a373 0%, #c19a6b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 var(--space-6);
  }

  .about-content {
    font-size: var(--font-size-base);
    line-height: 1.7;
    color: var(--color-text-secondary);
  }

  .about-content p {
    margin-bottom: var(--space-4);
  }

  .about-content p:last-child {
    margin-bottom: 0;
  }

  .about-content strong {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
  }

  /* CTA Buttons */
  .cta-buttons {
    display: flex;
    gap: var(--space-4);
    margin-top: var(--space-8);
    flex-wrap: wrap;
  }

  .cta-btn {
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-md);
    text-decoration: none;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
    transition: all 0.3s ease;
    display: inline-block;
  }

  .cta-btn.primary {
    background: linear-gradient(135deg, #d4a373 0%, #c19a6b 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(212, 163, 115, 0.3);
  }

  .cta-btn.primary:hover {
    background: linear-gradient(135deg, #c19a6b 0%, #b8935a 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 163, 115, 0.4);
  }

  .cta-btn.secondary {
    background: white;
    color: #d4a373;
    border: 2px solid #d4a373;
  }

  .cta-btn.secondary:hover {
    background: linear-gradient(135deg, #d4a373 0%, #c19a6b 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 163, 115, 0.4);
  }

  /* Footer */
  .landing-footer {
    text-align: center;
    padding: var(--space-8) 0;
    color: var(--color-text-secondary);
    margin-top: var(--space-12);
  }

  .landing-footer p {
    margin: var(--space-2) 0;
    font-size: var(--font-size-base);
  }

  .footer-tagline {
    font-style: italic;
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm) !important;
  }

  /* Responsive Design */
  @media (max-width: 1200px) {
    .hero-content {
      grid-template-columns: 1fr 320px;
      gap: var(--space-6);
    }

    .nav-links a {
      font-size: var(--font-size-sm);
    }
  }

  @media (max-width: 1024px) {
    .hero-content {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }

    .hero-events {
      max-width: 500px;
      margin: 0 auto;
    }
  }

  @media (max-width: 768px) {
    .nav-links {
      display: none;
    }

    .mobile-menu-btn {
      display: block;
    }

    .hero {
      padding: var(--space-6) 0;
    }

    .logo {
      max-width: 350px;
    }

    .tagline {
      font-size: var(--font-size-xl);
    }

    .subtitle {
      font-size: var(--font-size-base);
    }

    .about {
      padding: var(--space-6);
    }

    .about h2 {
      font-size: var(--font-size-xl);
    }

    .about-content {
      font-size: var(--font-size-sm);
    }

    .cta-buttons {
      flex-direction: column;
    }

    .cta-btn {
      text-align: center;
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .nav-container {
      padding: 0 var(--space-4);
      height: 60px;
    }

    .nav-logo img {
      height: 40px;
    }

    .logo {
      max-width: 280px;
    }

    .tagline {
      font-size: var(--font-size-lg);
    }

    .events-box,
    .quick-links-box,
    .about {
      padding: var(--space-4);
    }

    .hero-content {
      gap: var(--space-4);
    }
  }
</style>
