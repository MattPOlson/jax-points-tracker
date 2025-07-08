<script>
  import { user } from '$lib/stores/user';
  import { userProfile } from '$lib/stores/userProfile';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let isLoading = true;
  let accessDenied = false;
  let statsLoading = true;
  
  // Stats data
  let pendingReviews = 0;
  let activeMembers = 0;
  let pointsThisMonth = 0;

  // Check authorization and load data when user/profile changes
  $: if ($user !== undefined && $userProfile !== undefined) {
    isLoading = false;
    
    if (!$user) {
      // User not logged in - redirect to login
      goto('/login');
    } else if ($userProfile && !$userProfile.is_officer) {
      // User logged in but not an officer
      accessDenied = true;
    } else if ($userProfile && $userProfile.is_officer) {
      // User is an officer - load dashboard stats
      accessDenied = false;
      loadDashboardStats();
    }
  }

  onMount(() => {
    // Additional security check on client side
    if (typeof window !== 'undefined') {
      // If user is already verified as officer, load stats
      if ($userProfile?.is_officer) {
        loadDashboardStats();
      }
    }
  });

  // Officer tools configuration
  const officerTools = [
    {
      href: '/officers/approvals',
      label: 'Review Submissions',
      icon: '✅',
      description: 'Approve or deny point submissions',
      color: 'primary'
    },
    {
      href: '/officers/view-all',
      label: 'View All Points',
      icon: '📊',
      description: 'Browse all member points and submissions',
      color: 'secondary'
    },
    {
      href: '/officers/members',
      label: 'Manage Members',
      icon: '👥',
      description: 'View and manage member accounts',
      color: 'tertiary'
    },
    {
      href: '/officers/reports',
      label: 'Generate Reports',
      icon: '📈',
      description: 'Create activity and performance reports',
      color: 'quaternary'
    }
  ];

  // Load dashboard stats
  async function loadDashboardStats() {
    try {
      statsLoading = true;
      
      // Get pending reviews (submissions where approved is not true)
      const { data: pendingData, error: pendingError } = await supabase
        .from('point_submissions')
        .select('id')
        .neq('approved', true);
      
      if (pendingError) throw pendingError;
      pendingReviews = pendingData?.length || 0;

      // Get active members count
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id')
        .eq('active', true);
      
      if (membersError) throw membersError;
      activeMembers = membersData?.length || 0;

// Get points submitted this month (dynamic current month)
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      const { data: pointsData, error: pointsError } = await supabase
        .from('point_submissions')
        .select('points')
        .gte('submitted_at', firstDayOfMonth.toISOString())
        .lt('submitted_at', firstDayOfNextMonth.toISOString())
        .eq('approved', true);
      
      if (pointsError) throw pointsError;
      pointsThisMonth = pointsData?.reduce((sum, submission) => sum + (submission.points || 0), 0) || 0;

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Set default values on error
      pendingReviews = 0;
      activeMembers = 0;
      pointsThisMonth = 0;
    } finally {
      statsLoading = false;
    }
  }
</script>

<main>
  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Verifying permissions...</p>
    </div>
  {:else if !$user}
    <div class="auth-required">
      <div class="error-icon">🔒</div>
      <h2>Authentication Required</h2>
      <p>Please log in to access officer tools.</p>
      <a href="/login" class="cta-button">Sign In</a>
    </div>
  {:else if accessDenied}
    <div class="access-denied">
      <div class="error-icon">⚠️</div>
      <h2>Access Restricted</h2>
      <p>You are not authorized to view this page. Officer privileges are required.</p>
      <a href="/" class="cta-button">Return Home</a>
    </div>
  {:else}
    <div class="hero-section">
      <h1>🍺 Officer Tools 🍺</h1>
      <p class="subtitle">Administrative Dashboard</p>
      
      {#if $userProfile?.name}
        <div class="welcome-message">
          <p>Welcome, Officer <strong>{$userProfile.name}</strong>!</p>
          <p class="access-level">You have administrative privileges</p>
        </div>
      {/if}
    </div>

    <div class="tools-section">
      <h2>Administrative Tools</h2>
      <div class="tools-grid">
        {#each officerTools as tool}
          <a href={tool.href} class="tool-card {tool.color}">
            <div class="tool-icon">{tool.icon}</div>
            <div class="tool-content">
              <h3 class="tool-label">{tool.label}</h3>
              <p class="tool-description">{tool.description}</p>
            </div>
            <div class="tool-arrow">→</div>
          </a>
        {/each}
      </div>
    </div>

    <div class="quick-stats">
      <h3>Quick Overview</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-label">Pending Reviews</div>
            <div class="stat-value">
              {#if statsLoading}
                <div class="stat-loading"></div>
              {:else}
                {pendingReviews}
              {/if}
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-label">Active Members</div>
            <div class="stat-value">
              {#if statsLoading}
                <div class="stat-loading"></div>
              {:else}
                {activeMembers}
              {/if}
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <div class="stat-label">Points This Month</div>
            <div class="stat-value">
              {#if statsLoading}
                <div class="stat-loading"></div>
              {:else}
                {pointsThisMonth.toLocaleString()}
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  /* Base styles */
  main {
    margin: 0 auto;
    padding: 1rem;
    width: 90%;
    max-width: 900px;
    text-align: center;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: #666;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 62, 0, 0.2);
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .auth-required,
  .access-denied {
    background: white;
    border-radius: 6px;
    padding: 3rem 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #dc2626;
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .auth-required h2,
  .access-denied h2 {
    color: #dc2626;
    font-size: 1.75rem;
    margin-bottom: 1rem;
    text-transform: none;
  }

  .auth-required p,
  .access-denied p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .hero-section {
    margin-bottom: 3rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 3.5rem;
    font-weight: 100;
    margin: 0 0 0.25em;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #333;
    font-weight: 500;
    margin-bottom: 2rem;
  }

  .welcome-message {
    background: linear-gradient(135deg, #fff 0%, #fef7f0 100%);
    border: 1px solid #ff3e00;
    border-radius: 6px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    box-shadow: 0 2px 8px rgba(255, 62, 0, 0.1);
  }

  .welcome-message p {
    margin: 0.5rem 0;
    color: #333;
  }

  .access-level {
    font-size: 0.9rem;
    color: #ff3e00 !important;
    font-weight: 600;
  }

  .tools-section h2 {
    color: #333;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
    text-transform: none;
  }

  .tools-grid {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .tool-card {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1.5rem;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
  }

  .tool-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--accent-color);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .tool-card:hover::before {
    transform: translateX(0);
  }

  .tool-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .tool-card.primary {
    --accent-color: #2563eb;
  }

  .tool-card.secondary {
    --accent-color: #059669;
  }

  .tool-card.tertiary {
    --accent-color: #dc2626;
  }

  .tool-card.quaternary {
    --accent-color: #7c3aed;
  }

  .tool-card:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }

  .tool-icon {
    font-size: 2.5rem;
    margin-right: 1.5rem;
    min-width: 3rem;
  }

  .tool-content {
    flex: 1;
    text-align: left;
  }

  .tool-label {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.5rem 0;
    transition: color 0.3s ease;
  }

  .tool-card:hover .tool-label {
    color: var(--accent-color);
  }

  .tool-description {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
    line-height: 1.4;
  }

  .tool-arrow {
    font-size: 1.5rem;
    color: #ccc;
    transition: all 0.3s ease;
    margin-left: 1rem;
  }

  .tool-card:hover .tool-arrow {
    color: var(--accent-color);
    transform: translateX(4px);
  }

  .quick-stats h3 {
    color: #333;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-transform: none;
  }

  .stats-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    font-size: 1.75rem;
    margin-right: 1rem;
  }

  .stat-content {
    text-align: left;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ff3e00;
  }

  .stat-loading {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 62, 0, 0.2);
    border-top: 2px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .cta-button {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 2rem;
    background-color: #ff3e00;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .cta-button:hover {
    background-color: #e63600;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
  }

  /* Mobile styles */
  @media (max-width: 480px) {
    main {
      padding: 4.5rem 1rem 1rem;
      justify-content: flex-start;
    }

    h1 {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .welcome-message {
      padding: 1rem;
      margin: 1rem 0;
    }

    .tools-grid {
      gap: 1rem;
    }

    .tool-card {
      padding: 1rem;
      flex-direction: column;
      text-align: center;
    }

    .tool-icon {
      margin-right: 0;
      margin-bottom: 0.75rem;
      font-size: 2rem;
    }

    .tool-content {
      text-align: center;
    }

    .tool-arrow {
      margin-left: 0;
      margin-top: 0.5rem;
    }

    .stats-grid {
      gap: 0.75rem;
    }

    .stat-card {
      padding: 1rem;
    }
  }

  /* Desktop styles */
  @media (min-width: 640px) {
    .tools-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 1024px) {
    main {
      max-width: 1200px;
    }

    .tools-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }

    .tool-card {
      padding: 2rem;
    }
  }
</style>