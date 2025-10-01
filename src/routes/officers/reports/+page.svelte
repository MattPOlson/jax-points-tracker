<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Container, Button } from '$lib/components/ui';

  let pageTitle = 'Coming Soon';
  let featureName = 'This Feature';

  // Determine feature name based on current route
  onMount(() => {
    const pathname = $page.url.pathname;
    
    if (pathname.includes('/officers/members')) {
      pageTitle = 'Member Management';
      featureName = 'Member Management Tools';
    } else if (pathname.includes('/officers/reports')) {
      pageTitle = 'Reports Dashboard';
      featureName = 'Reports & Analytics';
    } else if (pathname.includes('/officers/')) {
      // Generic officer tool
      const segments = pathname.split('/');
      const toolName = segments[segments.length - 1];
      pageTitle = toolName.charAt(0).toUpperCase() + toolName.slice(1);
      featureName = `${pageTitle} Tools`;
    }
  });

  function goBackToOfficers() {
    goto('/officers');
  }
</script>

<Container size="md">
  <div class="coming-soon-container">
    <div class="construction-icon">🚧</div>

    <div class="hero-section">
      <h1>{pageTitle}</h1>
      <p class="subtitle">Coming Soon</p>
    </div>

    <div class="content-section">
      <div class="message-card">
        <div class="brew-icon">🍺</div>
        <h2>We're Brewing Something Special!</h2>
        <p class="description">
          {featureName} is currently under development. Our team is working hard to bring you 
          powerful new tools to help manage the JAX Members Portal.
        </p>
        
        <div class="features-preview">
          <h3>What's Coming:</h3>
          <ul class="features-list">
            {#if pageTitle === 'Member Management'}
              <li>👤 View and edit member profiles</li>
              <li>🔧 Manage officer permissions</li>
              <li>📊 Member activity tracking</li>
              <li>📧 Bulk communication tools</li>
            {:else if pageTitle === 'Reports Dashboard'}
              <li>📈 Monthly activity reports</li>
              <li>🏆 Points distribution analytics</li>
              <li>📋 Submission trend analysis</li>
              <li>📊 Member engagement metrics</li>
            {:else}
              <li>⚡ Powerful administrative tools</li>
              <li>📊 Advanced analytics</li>
              <li>🔧 Enhanced management features</li>
              <li>📈 Real-time reporting</li>
            {/if}
          </ul>
        </div>

        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-icon">🎯</div>
            <div class="timeline-content">
              <strong>Phase 1:</strong> Core functionality development
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-icon">🧪</div>
            <div class="timeline-content">
              <strong>Phase 2:</strong> Testing and refinement
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-icon">🚀</div>
            <div class="timeline-content">
              <strong>Phase 3:</strong> Launch and deployment
            </div>
          </div>
        </div>
      </div>

      <div class="action-section">
        <Button variant="primary" on:click={goBackToOfficers}>
          ← Back to Officer Tools
        </Button>
        
        <div class="contact-info">
          <p>Have suggestions or questions about this feature?</p>
          <p class="contact-text">Contact the development team for more information.</p>
        </div>
      </div>
    </div>
  </div>
</Container>

<style>

  .coming-soon-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .construction-icon {
    font-size: 4rem;
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  .hero-section h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 3rem;
    font-weight: 100;
    margin: 0 0 0.25em;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #666;
    font-weight: 500;
    margin-bottom: 2rem;
  }

  .content-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .message-card {
    background: white;
    border-radius: 6px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
  }

  .brew-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .message-card h2 {
    color: #333;
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-transform: none;
  }

  .description {
    color: #666;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .features-preview {
    text-align: left;
    margin-bottom: 2rem;
  }

  .features-preview h3 {
    color: #333;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-align: center;
  }

  .features-list {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 0.75rem;
  }

  .features-list li {
    background: #f8fafc;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    border-left: 3px solid #2563eb;
    color: #333;
    font-weight: 500;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
  }

  .timeline-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: left;
  }

  .timeline-icon {
    font-size: 1.5rem;
    min-width: 2rem;
  }

  .timeline-content {
    color: #666;
    font-size: 0.95rem;
  }

  .timeline-content strong {
    color: #333;
  }

  .action-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }


  .contact-info {
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1.5rem;
    max-width: 400px;
  }

  .contact-info p {
    margin: 0.5rem 0;
    color: #666;
  }

  .contact-text {
    font-size: 0.9rem;
    font-style: italic;
  }

  /* Mobile styles */
  @media (max-width: 480px) {
    .construction-icon {
      font-size: 3rem;
    }

    .hero-section h1 {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .message-card {
      padding: 1.5rem;
    }

    .message-card h2 {
      font-size: 1.5rem;
    }

    .description {
      font-size: 1rem;
    }

    .features-list {
      gap: 0.5rem;
    }

    .features-list li {
      padding: 0.5rem 0.75rem;
      font-size: 0.9rem;
    }

    .timeline {
      gap: 0.75rem;
    }

    .timeline-item {
      gap: 0.75rem;
    }

    .timeline-icon {
      font-size: 1.25rem;
      min-width: 1.75rem;
    }

    .timeline-content {
      font-size: 0.9rem;
    }

    .contact-info {
      padding: 1rem;
    }
  }

  /* Desktop styles */
  @media (min-width: 640px) {
    .hero-section h1 {
      font-size: 4rem;
    }

    .subtitle {
      font-size: 1.25rem;
    }

    .message-card {
      padding: 3rem;
    }

    .features-list {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .timeline {
      flex-direction: row;
      justify-content: center;
      gap: 2rem;
    }

    .timeline-item {
      flex-direction: column;
      text-align: center;
      max-width: 200px;
    }

    .timeline-icon {
      font-size: 2rem;
    }
  }
</style>