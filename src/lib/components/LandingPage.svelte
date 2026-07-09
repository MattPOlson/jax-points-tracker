<script>
  import { goto } from '$app/navigation';
  import { Hero, Container, Button, OverlappingCard } from '$lib/components/ui';
  import { Trophy, Award, CalendarDays, Users } from 'lucide-svelte';

  // Shown by the root layout to logged-out visitors instead of app pages
  // (#97). With RLS, the anon role reads no data, so app pages would only
  // render empty shells; this never fires a data query.
  const features = [
    {
      icon: Award,
      title: 'Points & Leaderboard',
      text: 'Earn points for brewing, judging, and club activity — and see where you stand.'
    },
    {
      icon: Trophy,
      title: 'Competitions',
      text: 'Enter club competitions, track your entries, and view published results.'
    },
    {
      icon: CalendarDays,
      title: 'Events & Calendar',
      text: 'Meetings, brew days, and festivals — sign up and stay in the loop.'
    },
    {
      icon: Users,
      title: 'Member Community',
      text: 'A private portal built by and for Jacksonville homebrewers.'
    }
  ];
</script>

<main>
  <Hero
    title="Have Fun Brew Better Beer!"
    subtitle="Jacksonville Ale Exchange"
    backgroundImage="/Jax-Banner.jpg"
    overlay={true}
    large={true}
  />

  <OverlappingCard>
    <p class="cta-text">
      The JAX Members Portal is where Jacksonville Ale Exchange members track brewing
      points, enter competitions, and sign up for club events.
    </p>
    <Button variant="primary" size="lg" on:click={() => goto('/login')}>
      Member Login
    </Button>
    <p class="cta-hint">Club data is for members only — sign in to get started.</p>
  </OverlappingCard>

  <Container size="lg">
    <section class="features-section">
      <h2 class="section-title">Inside the Portal</h2>
      <div class="features-grid">
        {#each features as feature, i}
          <div class="feature-card" style="--stagger: {i}">
            <div class="feature-icon">
              <svelte:component this={feature.icon} size={32} strokeWidth={1.5} />
            </div>
            <h3 class="feature-title">{feature.title}</h3>
            <p class="feature-text">{feature.text}</p>
          </div>
        {/each}
      </div>
    </section>
  </Container>
</main>

<style>
  .cta-text {
    margin: 0 0 var(--space-6);
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
    line-height: 1.6;
  }

  .cta-hint {
    margin: var(--space-4) 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .features-section {
    margin: var(--space-16) 0 var(--space-20);
  }

  .section-title {
    font-size: var(--font-size-2xl);
    color: var(--color-brand-primary);
    margin-bottom: var(--space-8);
    font-weight: var(--font-weight-bold);
    text-align: center;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-6);
  }

  .feature-card {
    background: var(--color-bg-card);
    border-radius: var(--radius-md);
    border-top: 3px solid var(--color-brand-gold);
    box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    padding: var(--space-8) var(--space-6);
    text-align: center;
    animation: rise-in 0.5s ease-out both;
    animation-delay: calc(var(--stagger) * 90ms);
  }

  .feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--color-brand-primary);
    color: var(--color-brand-gold);
    margin-bottom: var(--space-4);
  }

  .feature-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-lg);
    color: var(--color-brand-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0 0 var(--space-2);
  }

  .feature-text {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  @keyframes rise-in {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .feature-card {
      animation: none;
    }
  }

  @media (max-width: 640px) {
    .features-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
