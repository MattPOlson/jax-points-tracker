<script>
  import { Button, Container } from '$lib/components/ui';
</script>

<div class="landing-page">
  <Container size="lg">
    <main>
      <!-- Hero Section with Logo -->
      <section class="hero">
        <div class="logo-container">
          <img src="/logo.png" alt="Jacksonville Ale Exchange Logo" class="logo" />
        </div>
        <h1 class="tagline">Have Fun. Brew Better Beer.</h1>
      </section>

      <!-- About Us Section -->
      <section class="about">
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
      </section>

      <!-- Call to Action Section -->
      <section class="cta-section">
        <div class="cta-cards">
          <a href="/portal" class="cta-card">
            <div class="card-icon">🍺</div>
            <h3>Members Portal</h3>
            <p>Access competitions, track points, and manage your brewing achievements</p>
            <span class="cta-arrow">→</span>
          </a>

          <a href="https://calendar.google.com/calendar/embed?src=jaxaleexchange@gmail.com&ctz=America/New_York"
             target="_blank"
             rel="noopener noreferrer"
             class="cta-card">
            <div class="card-icon">📅</div>
            <h3>Event Calendar</h3>
            <p>View upcoming meetings, competitions, and brewing events</p>
            <span class="cta-arrow">→</span>
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <p>Jacksonville Ale Exchange Homebrew Club</p>
        <p class="footer-tagline">Brewing Excellence Since Day One</p>
      </footer>
    </main>
  </Container>
</div>

<style>
  .landing-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: var(--space-8) 0;
  }

  main {
    display: flex;
    flex-direction: column;
    gap: var(--space-16);
  }

  /* Hero Section */
  .hero {
    text-align: center;
    padding: var(--space-12) 0;
  }

  .logo-container {
    margin-bottom: var(--space-8);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo {
    max-width: 500px;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
    transition: transform 0.3s ease;
  }

  .logo:hover {
    transform: scale(1.02);
  }

  .tagline {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  /* About Section */
  .about {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-10);
    box-shadow: var(--shadow-lg);
  }

  .about h2 {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-brand-primary);
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .about-content {
    max-width: 800px;
    margin: 0 auto;
    font-size: var(--font-size-lg);
    line-height: 1.8;
    color: var(--color-text-secondary);
  }

  .about-content p {
    margin-bottom: var(--space-6);
  }

  .about-content p:last-child {
    margin-bottom: 0;
  }

  .about-content strong {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
  }

  /* CTA Section */
  .cta-section {
    padding: var(--space-8) 0;
  }

  .cta-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-8);
    max-width: 900px;
    margin: 0 auto;
  }

  .cta-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    text-decoration: none;
    color: inherit;
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
  }

  .cta-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  .cta-card:hover::before {
    transform: scaleX(1);
  }

  .cta-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-xl);
    border-color: var(--color-brand-primary);
  }

  .card-icon {
    font-size: 3rem;
    margin-bottom: var(--space-4);
  }

  .cta-card h3 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-3);
  }

  .cta-card p {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: var(--space-4);
  }

  .cta-arrow {
    display: inline-block;
    font-size: var(--font-size-2xl);
    color: var(--color-brand-primary);
    transition: transform 0.3s ease;
  }

  .cta-card:hover .cta-arrow {
    transform: translateX(8px);
  }

  /* Footer */
  .landing-footer {
    text-align: center;
    padding: var(--space-8) 0;
    color: var(--color-text-secondary);
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

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .landing-page {
      padding: var(--space-4) 0;
    }

    main {
      gap: var(--space-8);
    }

    .hero {
      padding: var(--space-6) 0;
    }

    .logo {
      max-width: 300px;
    }

    .tagline {
      font-size: var(--font-size-2xl);
    }

    .about {
      padding: var(--space-6);
    }

    .about h2 {
      font-size: var(--font-size-2xl);
      margin-bottom: var(--space-6);
    }

    .about-content {
      font-size: var(--font-size-base);
    }

    .cta-cards {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }

    .cta-card {
      padding: var(--space-6);
    }

    .card-icon {
      font-size: 2.5rem;
    }

    .cta-card h3 {
      font-size: var(--font-size-xl);
    }
  }

  @media (max-width: 480px) {
    .logo {
      max-width: 250px;
    }

    .tagline {
      font-size: var(--font-size-xl);
    }

    .about {
      padding: var(--space-4);
    }

    .about h2 {
      font-size: var(--font-size-xl);
    }

    .about-content {
      font-size: var(--font-size-sm);
    }

    .cta-card {
      padding: var(--space-4);
    }

    .card-icon {
      font-size: 2rem;
    }

    .cta-card h3 {
      font-size: var(--font-size-lg);
    }

    .cta-card p {
      font-size: var(--font-size-sm);
    }
  }
</style>
