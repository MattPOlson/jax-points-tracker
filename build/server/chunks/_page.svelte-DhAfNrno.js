import { c as create_ssr_component, a as subscribe, v as validate_component, d as escape, e as each, b as add_attribute } from './ssr-CFMHIens.js';
import { u as user } from './user-DxtT6N6z.js';
import { u as userProfile } from './userProfile-BAUZwBX2.js';
import { s as supabase } from './supabaseClient-D_8i9Ohq.js';
import { g as goto } from './client-C3KLrhj1.js';
import { c as competitionManagementStore } from './competitionManagementStore-CIPoqnzm.js';
import { H as Hero } from './Hero-B5bq0fDE.js';
import { L as LoadingSpinner } from './LoadingSpinner-DyPK4ei8.js';
import { E as EmptyState } from './EmptyState-OwOXOni3.js';
import { C as Container } from './Container-C5rGKtUK.js';
import { B as Badge } from './Badge-CAtCSI__.js';
import './index-Ct3aIOD7.js';
import './false-CRHihH2U.js';
import '@supabase/supabase-js';
import './exports-DKuYoYKl.js';

const css = {
  code: ".welcome-message.svelte-tdgggh.svelte-tdgggh{background:linear-gradient(135deg, #fff 0%, #fef7f0 100%);border:1px solid #ff3e00;border-radius:6px;padding:1.5rem;margin:1.5rem 0;box-shadow:0 2px 8px rgba(255, 62, 0, 0.1)}.welcome-message.svelte-tdgggh p.svelte-tdgggh{margin:0.5rem 0;color:#333}.access-level.svelte-tdgggh.svelte-tdgggh{font-size:0.9rem;color:#ff3e00 !important;font-weight:600}.tools-section.svelte-tdgggh h2.svelte-tdgggh{color:#333;font-size:1.5rem;font-weight:600;margin-bottom:2rem;text-transform:none}.tools-grid.svelte-tdgggh.svelte-tdgggh{display:grid;gap:1.5rem;margin-bottom:3rem}.tool-card.svelte-tdgggh.svelte-tdgggh{display:flex;align-items:center;background:white;border:1px solid #e5e7eb;border-radius:6px;padding:1.5rem;text-decoration:none;transition:all 0.3s ease;box-shadow:0 2px 4px rgba(0, 0, 0, 0.1);position:relative;overflow:hidden}.tool-card.svelte-tdgggh.svelte-tdgggh::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:var(--accent-color);transform:translateX(-100%);transition:transform 0.3s ease}.tool-card.svelte-tdgggh.svelte-tdgggh:hover::before{transform:translateX(0)}.tool-card.svelte-tdgggh.svelte-tdgggh:hover{transform:translateY(-4px);box-shadow:0 8px 25px rgba(0, 0, 0, 0.15)}.tool-card.primary.svelte-tdgggh.svelte-tdgggh{--accent-color:#2563eb}.tool-card.secondary.svelte-tdgggh.svelte-tdgggh{--accent-color:#059669}.tool-card.competition.svelte-tdgggh.svelte-tdgggh{--accent-color:#ff3e00}.tool-card.tertiary.svelte-tdgggh.svelte-tdgggh{--accent-color:#dc2626}.tool-card.quaternary.svelte-tdgggh.svelte-tdgggh{--accent-color:#7c3aed}.tool-card.svelte-tdgggh.svelte-tdgggh:hover{border-color:var(--accent-color);color:var(--accent-color)}.tool-icon.svelte-tdgggh.svelte-tdgggh{font-size:2.5rem;margin-right:1.5rem;min-width:3rem}.tool-content.svelte-tdgggh.svelte-tdgggh{flex:1;text-align:left}.tool-label.svelte-tdgggh.svelte-tdgggh{font-size:1.2rem;font-weight:600;color:#333;margin:0 0 0.5rem 0;transition:color 0.3s ease}.tool-card.svelte-tdgggh:hover .tool-label.svelte-tdgggh{color:var(--accent-color)}.tool-description.svelte-tdgggh.svelte-tdgggh{font-size:0.9rem;color:#666;margin:0;line-height:1.4}.tool-stats.svelte-tdgggh.svelte-tdgggh{display:flex;gap:0.5rem;margin-top:0.5rem}.tool-arrow.svelte-tdgggh.svelte-tdgggh{font-size:1.5rem;color:#ccc;transition:all 0.3s ease;margin-left:1rem}.tool-card.svelte-tdgggh:hover .tool-arrow.svelte-tdgggh{color:var(--accent-color);transform:translateX(4px)}.quick-stats.svelte-tdgggh h3.svelte-tdgggh{color:#333;font-size:1.25rem;font-weight:600;margin-bottom:1.5rem;text-transform:none}.stats-grid.svelte-tdgggh.svelte-tdgggh{display:grid;gap:1rem;margin-bottom:2rem}.stat-card.svelte-tdgggh.svelte-tdgggh{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:1.25rem;display:flex;align-items:center;box-shadow:0 1px 3px rgba(0, 0, 0, 0.1)}.stat-icon.svelte-tdgggh.svelte-tdgggh{font-size:1.75rem;margin-right:1rem}.stat-content.svelte-tdgggh.svelte-tdgggh{text-align:left}.stat-label.svelte-tdgggh.svelte-tdgggh{font-size:0.85rem;color:#666;margin-bottom:0.25rem}.stat-value.svelte-tdgggh.svelte-tdgggh{font-size:1.5rem;font-weight:700;color:#ff3e00}.stat-loading.svelte-tdgggh.svelte-tdgggh{width:20px;height:20px;border:2px solid rgba(255, 62, 0, 0.2);border-top:2px solid #ff3e00;border-radius:50%;animation:spin 1s linear infinite}@media(max-width: 480px){.welcome-message.svelte-tdgggh.svelte-tdgggh{padding:1rem;margin:1rem 0}.tools-grid.svelte-tdgggh.svelte-tdgggh{gap:1rem}.tool-card.svelte-tdgggh.svelte-tdgggh{padding:1rem;flex-direction:column;text-align:center}.tool-icon.svelte-tdgggh.svelte-tdgggh{margin-right:0;margin-bottom:0.75rem;font-size:2rem}.tool-content.svelte-tdgggh.svelte-tdgggh{text-align:center}.tool-arrow.svelte-tdgggh.svelte-tdgggh{margin-left:0;margin-top:0.5rem}.stats-grid.svelte-tdgggh.svelte-tdgggh{gap:0.75rem}.stat-card.svelte-tdgggh.svelte-tdgggh{padding:1rem}.tool-stats.svelte-tdgggh.svelte-tdgggh{justify-content:center}}@media(min-width: 640px){.tools-grid.svelte-tdgggh.svelte-tdgggh{grid-template-columns:repeat(2, 1fr)}.stats-grid.svelte-tdgggh.svelte-tdgggh{grid-template-columns:repeat(3, 1fr)}}@media(min-width: 768px){.stats-grid.svelte-tdgggh.svelte-tdgggh{grid-template-columns:repeat(5, 1fr)}}@media(min-width: 1024px){.tools-grid.svelte-tdgggh.svelte-tdgggh{grid-template-columns:repeat(2, 1fr);gap:2rem}.tool-card.svelte-tdgggh.svelte-tdgggh{padding:2rem}}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import { user } from '$lib/stores/user';\\n  import { userProfile } from '$lib/stores/userProfile';\\n  import { supabase } from '$lib/supabaseClient';\\n  import { goto } from '$app/navigation';\\n  import { onMount } from 'svelte';\\n  import { competitionManagementStore } from '$lib/stores/competitionManagementStore';\\n  import { Hero, Container, LoadingSpinner, EmptyState, Badge } from '$lib/components/ui';\\n\\n  let isLoading = true;\\n  let accessDenied = false;\\n  let statsLoading = true;\\n  \\n  // Stats data\\n  let pendingReviews = 0;\\n  let activeMembers = 0;\\n  let pointsThisMonth = 0;\\n  let activeCompetitions = 0;\\n  let totalCompetitionEntries = 0;\\n\\n  // Check authorization and load data when user/profile changes\\n  $: if ($user !== undefined && $userProfile !== undefined) {\\n    isLoading = false;\\n    \\n    if (!$user) {\\n      // User not logged in - redirect to login\\n      goto('/login');\\n    } else if ($userProfile && !$userProfile.is_officer) {\\n      // User logged in but not an officer\\n      accessDenied = true;\\n    } else if ($userProfile && $userProfile.is_officer) {\\n      // User is an officer - load dashboard stats\\n      accessDenied = false;\\n      loadDashboardStats();\\n      // Initialize competition store for officers\\n      competitionManagementStore.initialize();\\n    }\\n  }\\n\\n  onMount(() => {\\n    // Additional security check on client side\\n    if (typeof window !== 'undefined') {\\n      // If user is already verified as officer, load stats\\n      if ($userProfile?.is_officer) {\\n        loadDashboardStats();\\n      }\\n    }\\n  });\\n\\n  // Subscribe to competition stats\\n  $: if ($competitionManagementStore.stats) {\\n    activeCompetitions = $competitionManagementStore.stats.active;\\n    totalCompetitionEntries = $competitionManagementStore.stats.totalEntries;\\n  }\\n\\n  // Officer tools configuration - Updated with competitions\\n  const officerTools = [\\n    {\\n      href: '/officers/approvals',\\n      label: 'Review Submissions',\\n      icon: '✅',\\n      description: 'Approve or deny point submissions',\\n      color: 'primary'\\n    },\\n    {\\n      href: '/officers/view-all',\\n      label: 'View All Points',\\n      icon: '📊',\\n      description: 'Browse all member points and submissions',\\n      color: 'secondary'\\n    },\\n    {\\n      href: '/officers/manage-competitions',\\n      label: 'Manage Competitions',\\n      icon: '🏆',\\n      description: 'Create and manage brewing competitions',\\n      color: 'competition'\\n    },\\n    {\\n      href: '/officers/members',\\n      label: 'Manage Members',\\n      icon: '👥',\\n      description: 'View and manage member accounts',\\n      color: 'tertiary'\\n    },\\n    {\\n      href: '/officers/reports',\\n      label: 'Generate Reports',\\n      icon: '📈',\\n      description: 'Create activity and performance reports',\\n      color: 'quaternary'\\n    }\\n  ];\\n\\n  // Load dashboard stats\\n  async function loadDashboardStats() {\\n    try {\\n      statsLoading = true;\\n      \\n      // Get pending reviews (submissions where approved is not true)\\n      const { data: pendingData, error: pendingError } = await supabase\\n        .from('point_submissions')\\n        .select('id')\\n        .neq('approved', true);\\n      \\n      if (pendingError) throw pendingError;\\n      pendingReviews = pendingData?.length || 0;\\n\\n      // Get active members count\\n      const { data: membersData, error: membersError } = await supabase\\n        .from('members')\\n        .select('id')\\n        .eq('active', true);\\n      \\n      if (membersError) throw membersError;\\n      activeMembers = membersData?.length || 0;\\n\\n      // Get points submitted this month (dynamic current month)\\n      const now = new Date();\\n      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);\\n      const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);\\n      \\n      const { data: pointsData, error: pointsError } = await supabase\\n        .from('point_submissions')\\n        .select('points')\\n        .gte('submitted_at', firstDayOfMonth.toISOString())\\n        .lt('submitted_at', firstDayOfNextMonth.toISOString())\\n        .eq('approved', true);\\n      \\n      if (pointsError) throw pointsError;\\n      pointsThisMonth = pointsData?.reduce((sum, submission) => sum + (submission.points || 0), 0) || 0;\\n\\n      // Load competition stats\\n      await competitionManagementStore.loadCompetitions();\\n\\n    } catch (error) {\\n      console.error('Error loading dashboard stats:', error);\\n      // Set default values on error\\n      pendingReviews = 0;\\n      activeMembers = 0;\\n      pointsThisMonth = 0;\\n    } finally {\\n      statsLoading = false;\\n    }\\n  }\\n<\/script>\\n\\n<Container size=\\"lg\\">\\n  {#if isLoading}\\n    <LoadingSpinner message=\\"Verifying permissions...\\" />\\n  {:else if !$user}\\n    <EmptyState\\n      icon=\\"🔒\\"\\n      title=\\"Authentication Required\\"\\n      message=\\"Please log in to access officer tools.\\"\\n      actionLabel=\\"Sign In\\"\\n      actionHref=\\"/login\\"\\n    />\\n  {:else if accessDenied}\\n    <EmptyState\\n      icon=\\"⚠️\\"\\n      title=\\"Access Restricted\\"\\n      message=\\"You are not authorized to view this page. Officer privileges are required.\\"\\n      actionLabel=\\"Return Home\\"\\n      actionHref=\\"/\\"\\n    />\\n  {:else}\\n    <Hero title=\\"Officer Tools\\" subtitle=\\"Administrative Dashboard\\" icon=\\"🍺\\" center={true} />\\n\\n    {#if $userProfile?.name}\\n      <div class=\\"welcome-message\\">\\n        <p>Welcome, Officer <strong>{$userProfile.name}</strong>!</p>\\n        <p class=\\"access-level\\">You have administrative privileges</p>\\n      </div>\\n    {/if}\\n\\n    <div class=\\"tools-section\\">\\n      <h2>Administrative Tools</h2>\\n      <div class=\\"tools-grid\\">\\n        {#each officerTools as tool}\\n          <a href={tool.href} class=\\"tool-card {tool.color}\\">\\n            <div class=\\"tool-icon\\">{tool.icon}</div>\\n            <div class=\\"tool-content\\">\\n              <h3 class=\\"tool-label\\">{tool.label}</h3>\\n              <p class=\\"tool-description\\">{tool.description}</p>\\n              {#if tool.label === 'Manage Competitions' && !$competitionManagementStore.isLoading}\\n                <div class=\\"tool-stats\\">\\n                  <Badge size=\\"sm\\">{activeCompetitions} Active</Badge>\\n                  <Badge size=\\"sm\\">{totalCompetitionEntries} Entries</Badge>\\n                </div>\\n              {/if}\\n            </div>\\n            <div class=\\"tool-arrow\\">→</div>\\n          </a>\\n        {/each}\\n      </div>\\n    </div>\\n\\n    <div class=\\"quick-stats\\">\\n      <h3>Quick Overview</h3>\\n      <div class=\\"stats-grid\\">\\n        <div class=\\"stat-card\\">\\n          <div class=\\"stat-icon\\">📝</div>\\n          <div class=\\"stat-content\\">\\n            <div class=\\"stat-label\\">Pending Reviews</div>\\n            <div class=\\"stat-value\\">\\n              {#if statsLoading}\\n                <div class=\\"stat-loading\\"></div>\\n              {:else}\\n                {pendingReviews}\\n              {/if}\\n            </div>\\n          </div>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <div class=\\"stat-icon\\">👥</div>\\n          <div class=\\"stat-content\\">\\n            <div class=\\"stat-label\\">Active Members</div>\\n            <div class=\\"stat-value\\">\\n              {#if statsLoading}\\n                <div class=\\"stat-loading\\"></div>\\n              {:else}\\n                {activeMembers}\\n              {/if}\\n            </div>\\n          </div>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <div class=\\"stat-icon\\">🆙</div>\\n          <div class=\\"stat-content\\">\\n            <div class=\\"stat-label\\">Points This Month</div>\\n            <div class=\\"stat-value\\">\\n              {#if statsLoading}\\n                <div class=\\"stat-loading\\"></div>\\n              {:else}\\n                {pointsThisMonth.toLocaleString()}\\n              {/if}\\n            </div>\\n          </div>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <div class=\\"stat-icon\\">🏆</div>\\n          <div class=\\"stat-content\\">\\n            <div class=\\"stat-label\\">Active Competitions</div>\\n            <div class=\\"stat-value\\">\\n              {#if $competitionManagementStore.isLoading}\\n                <div class=\\"stat-loading\\"></div>\\n              {:else}\\n                {activeCompetitions}\\n              {/if}\\n            </div>\\n          </div>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <div class=\\"stat-icon\\">🍺</div>\\n          <div class=\\"stat-content\\">\\n            <div class=\\"stat-label\\">Competition Entries</div>\\n            <div class=\\"stat-value\\">\\n              {#if $competitionManagementStore.isLoading}\\n                <div class=\\"stat-loading\\"></div>\\n              {:else}\\n                {totalCompetitionEntries}\\n              {/if}\\n            </div>\\n          </div>\\n        </div>\\n      </div>\\n    </div>\\n  {/if}\\n</Container>\\n\\n<style>\\n  .welcome-message {\\n    background: linear-gradient(135deg, #fff 0%, #fef7f0 100%);\\n    border: 1px solid #ff3e00;\\n    border-radius: 6px;\\n    padding: 1.5rem;\\n    margin: 1.5rem 0;\\n    box-shadow: 0 2px 8px rgba(255, 62, 0, 0.1);\\n  }\\n\\n  .welcome-message p {\\n    margin: 0.5rem 0;\\n    color: #333;\\n  }\\n\\n  .access-level {\\n    font-size: 0.9rem;\\n    color: #ff3e00 !important;\\n    font-weight: 600;\\n  }\\n\\n  .tools-section h2 {\\n    color: #333;\\n    font-size: 1.5rem;\\n    font-weight: 600;\\n    margin-bottom: 2rem;\\n    text-transform: none;\\n  }\\n\\n  .tools-grid {\\n    display: grid;\\n    gap: 1.5rem;\\n    margin-bottom: 3rem;\\n  }\\n\\n  .tool-card {\\n    display: flex;\\n    align-items: center;\\n    background: white;\\n    border: 1px solid #e5e7eb;\\n    border-radius: 6px;\\n    padding: 1.5rem;\\n    text-decoration: none;\\n    transition: all 0.3s ease;\\n    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\\n    position: relative;\\n    overflow: hidden;\\n  }\\n\\n  .tool-card::before {\\n    content: '';\\n    position: absolute;\\n    top: 0;\\n    left: 0;\\n    right: 0;\\n    height: 4px;\\n    background: var(--accent-color);\\n    transform: translateX(-100%);\\n    transition: transform 0.3s ease;\\n  }\\n\\n  .tool-card:hover::before {\\n    transform: translateX(0);\\n  }\\n\\n  .tool-card:hover {\\n    transform: translateY(-4px);\\n    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);\\n  }\\n\\n  .tool-card.primary {\\n    --accent-color: #2563eb;\\n  }\\n\\n  .tool-card.secondary {\\n    --accent-color: #059669;\\n  }\\n\\n  .tool-card.competition {\\n    --accent-color: #ff3e00;\\n  }\\n\\n  .tool-card.tertiary {\\n    --accent-color: #dc2626;\\n  }\\n\\n  .tool-card.quaternary {\\n    --accent-color: #7c3aed;\\n  }\\n\\n  .tool-card:hover {\\n    border-color: var(--accent-color);\\n    color: var(--accent-color);\\n  }\\n\\n  .tool-icon {\\n    font-size: 2.5rem;\\n    margin-right: 1.5rem;\\n    min-width: 3rem;\\n  }\\n\\n  .tool-content {\\n    flex: 1;\\n    text-align: left;\\n  }\\n\\n  .tool-label {\\n    font-size: 1.2rem;\\n    font-weight: 600;\\n    color: #333;\\n    margin: 0 0 0.5rem 0;\\n    transition: color 0.3s ease;\\n  }\\n\\n  .tool-card:hover .tool-label {\\n    color: var(--accent-color);\\n  }\\n\\n  .tool-description {\\n    font-size: 0.9rem;\\n    color: #666;\\n    margin: 0;\\n    line-height: 1.4;\\n  }\\n\\n  .tool-stats {\\n    display: flex;\\n    gap: 0.5rem;\\n    margin-top: 0.5rem;\\n  }\\n\\n  .tool-arrow {\\n    font-size: 1.5rem;\\n    color: #ccc;\\n    transition: all 0.3s ease;\\n    margin-left: 1rem;\\n  }\\n\\n  .tool-card:hover .tool-arrow {\\n    color: var(--accent-color);\\n    transform: translateX(4px);\\n  }\\n\\n  .quick-stats h3 {\\n    color: #333;\\n    font-size: 1.25rem;\\n    font-weight: 600;\\n    margin-bottom: 1.5rem;\\n    text-transform: none;\\n  }\\n\\n  .stats-grid {\\n    display: grid;\\n    gap: 1rem;\\n    margin-bottom: 2rem;\\n  }\\n\\n  .stat-card {\\n    background: white;\\n    border: 1px solid #e5e7eb;\\n    border-radius: 6px;\\n    padding: 1.25rem;\\n    display: flex;\\n    align-items: center;\\n    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .stat-icon {\\n    font-size: 1.75rem;\\n    margin-right: 1rem;\\n  }\\n\\n  .stat-content {\\n    text-align: left;\\n  }\\n\\n  .stat-label {\\n    font-size: 0.85rem;\\n    color: #666;\\n    margin-bottom: 0.25rem;\\n  }\\n\\n  .stat-value {\\n    font-size: 1.5rem;\\n    font-weight: 700;\\n    color: #ff3e00;\\n  }\\n\\n  .stat-loading {\\n    width: 20px;\\n    height: 20px;\\n    border: 2px solid rgba(255, 62, 0, 0.2);\\n    border-top: 2px solid #ff3e00;\\n    border-radius: 50%;\\n    animation: spin 1s linear infinite;\\n  }\\n\\n  /* Mobile styles */\\n  @media (max-width: 480px) {\\n    .welcome-message {\\n      padding: 1rem;\\n      margin: 1rem 0;\\n    }\\n\\n    .tools-grid {\\n      gap: 1rem;\\n    }\\n\\n    .tool-card {\\n      padding: 1rem;\\n      flex-direction: column;\\n      text-align: center;\\n    }\\n\\n    .tool-icon {\\n      margin-right: 0;\\n      margin-bottom: 0.75rem;\\n      font-size: 2rem;\\n    }\\n\\n    .tool-content {\\n      text-align: center;\\n    }\\n\\n    .tool-arrow {\\n      margin-left: 0;\\n      margin-top: 0.5rem;\\n    }\\n\\n    .stats-grid {\\n      gap: 0.75rem;\\n    }\\n\\n    .stat-card {\\n      padding: 1rem;\\n    }\\n\\n    .tool-stats {\\n      justify-content: center;\\n    }\\n  }\\n\\n  /* Desktop styles */\\n  @media (min-width: 640px) {\\n    .tools-grid {\\n      grid-template-columns: repeat(2, 1fr);\\n    }\\n\\n    .stats-grid {\\n      grid-template-columns: repeat(3, 1fr);\\n    }\\n  }\\n\\n  @media (min-width: 768px) {\\n    .stats-grid {\\n      grid-template-columns: repeat(5, 1fr);\\n    }\\n  }\\n\\n  @media (min-width: 1024px) {\\n    .tools-grid {\\n      grid-template-columns: repeat(2, 1fr);\\n      gap: 2rem;\\n    }\\n\\n    .tool-card {\\n      padding: 2rem;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AAgRE,4CAAiB,CACf,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,IAAI,CAAC,EAAE,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAC1D,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CACzB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,MAAM,CACf,MAAM,CAAE,MAAM,CAAC,CAAC,CAChB,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAC5C,CAEA,8BAAgB,CAAC,eAAE,CACjB,MAAM,CAAE,MAAM,CAAC,CAAC,CAChB,KAAK,CAAE,IACT,CAEA,yCAAc,CACZ,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,OAAO,CAAC,UAAU,CACzB,WAAW,CAAE,GACf,CAEA,4BAAc,CAAC,gBAAG,CAChB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GAAG,CAChB,aAAa,CAAE,IAAI,CACnB,cAAc,CAAE,IAClB,CAEA,uCAAY,CACV,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,MAAM,CACX,aAAa,CAAE,IACjB,CAEA,sCAAW,CACT,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CACzB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,MAAM,CACf,eAAe,CAAE,IAAI,CACrB,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACzB,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACxC,QAAQ,CAAE,QAAQ,CAClB,QAAQ,CAAE,MACZ,CAEA,sCAAU,QAAS,CACjB,OAAO,CAAE,EAAE,CACX,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,GAAG,CACX,UAAU,CAAE,IAAI,cAAc,CAAC,CAC/B,SAAS,CAAE,WAAW,KAAK,CAAC,CAC5B,UAAU,CAAE,SAAS,CAAC,IAAI,CAAC,IAC7B,CAEA,sCAAU,MAAM,QAAS,CACvB,SAAS,CAAE,WAAW,CAAC,CACzB,CAEA,sCAAU,MAAO,CACf,SAAS,CAAE,WAAW,IAAI,CAAC,CAC3B,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAC3C,CAEA,UAAU,oCAAS,CACjB,cAAc,CAAE,OAClB,CAEA,UAAU,sCAAW,CACnB,cAAc,CAAE,OAClB,CAEA,UAAU,wCAAa,CACrB,cAAc,CAAE,OAClB,CAEA,UAAU,qCAAU,CAClB,cAAc,CAAE,OAClB,CAEA,UAAU,uCAAY,CACpB,cAAc,CAAE,OAClB,CAEA,sCAAU,MAAO,CACf,YAAY,CAAE,IAAI,cAAc,CAAC,CACjC,KAAK,CAAE,IAAI,cAAc,CAC3B,CAEA,sCAAW,CACT,SAAS,CAAE,MAAM,CACjB,YAAY,CAAE,MAAM,CACpB,SAAS,CAAE,IACb,CAEA,yCAAc,CACZ,IAAI,CAAE,CAAC,CACP,UAAU,CAAE,IACd,CAEA,uCAAY,CACV,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACpB,UAAU,CAAE,KAAK,CAAC,IAAI,CAAC,IACzB,CAEA,wBAAU,MAAM,CAAC,yBAAY,CAC3B,KAAK,CAAE,IAAI,cAAc,CAC3B,CAEA,6CAAkB,CAChB,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CACT,WAAW,CAAE,GACf,CAEA,uCAAY,CACV,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,MAAM,CACX,UAAU,CAAE,MACd,CAEA,uCAAY,CACV,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACzB,WAAW,CAAE,IACf,CAEA,wBAAU,MAAM,CAAC,yBAAY,CAC3B,KAAK,CAAE,IAAI,cAAc,CAAC,CAC1B,SAAS,CAAE,WAAW,GAAG,CAC3B,CAEA,0BAAY,CAAC,gBAAG,CACd,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,GAAG,CAChB,aAAa,CAAE,MAAM,CACrB,cAAc,CAAE,IAClB,CAEA,uCAAY,CACV,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IAAI,CACT,aAAa,CAAE,IACjB,CAEA,sCAAW,CACT,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CACzB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,OAAO,CAChB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CACzC,CAEA,sCAAW,CACT,SAAS,CAAE,OAAO,CAClB,YAAY,CAAE,IAChB,CAEA,yCAAc,CACZ,UAAU,CAAE,IACd,CAEA,uCAAY,CACV,SAAS,CAAE,OAAO,CAClB,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,OACjB,CAEA,uCAAY,CACV,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,OACT,CAEA,yCAAc,CACZ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACvC,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CAC7B,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,IAAI,CAAC,EAAE,CAAC,MAAM,CAAC,QAC5B,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,4CAAiB,CACf,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,IAAI,CAAC,CACf,CAEA,uCAAY,CACV,GAAG,CAAE,IACP,CAEA,sCAAW,CACT,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,MACd,CAEA,sCAAW,CACT,YAAY,CAAE,CAAC,CACf,aAAa,CAAE,OAAO,CACtB,SAAS,CAAE,IACb,CAEA,yCAAc,CACZ,UAAU,CAAE,MACd,CAEA,uCAAY,CACV,WAAW,CAAE,CAAC,CACd,UAAU,CAAE,MACd,CAEA,uCAAY,CACV,GAAG,CAAE,OACP,CAEA,sCAAW,CACT,OAAO,CAAE,IACX,CAEA,uCAAY,CACV,eAAe,CAAE,MACnB,CACF,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,uCAAY,CACV,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CACtC,CAEA,uCAAY,CACV,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CACtC,CACF,CAEA,MAAO,YAAY,KAAK,CAAE,CACxB,uCAAY,CACV,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CACtC,CACF,CAEA,MAAO,YAAY,MAAM,CAAE,CACzB,uCAAY,CACV,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CAAC,CACrC,GAAG,CAAE,IACP,CAEA,sCAAW,CACT,OAAO,CAAE,IACX,CACF"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $competitionManagementStore, $$unsubscribe_competitionManagementStore;
  let $userProfile, $$unsubscribe_userProfile;
  let $user, $$unsubscribe_user;
  $$unsubscribe_competitionManagementStore = subscribe(competitionManagementStore, (value) => $competitionManagementStore = value);
  $$unsubscribe_userProfile = subscribe(userProfile, (value) => $userProfile = value);
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  let isLoading = true;
  let accessDenied = false;
  let statsLoading = true;
  let pendingReviews = 0;
  let activeMembers = 0;
  let pointsThisMonth = 0;
  let activeCompetitions = 0;
  let totalCompetitionEntries = 0;
  const officerTools = [
    {
      href: "/officers/approvals",
      label: "Review Submissions",
      icon: "✅",
      description: "Approve or deny point submissions",
      color: "primary"
    },
    {
      href: "/officers/view-all",
      label: "View All Points",
      icon: "📊",
      description: "Browse all member points and submissions",
      color: "secondary"
    },
    {
      href: "/officers/manage-competitions",
      label: "Manage Competitions",
      icon: "🏆",
      description: "Create and manage brewing competitions",
      color: "competition"
    },
    {
      href: "/officers/members",
      label: "Manage Members",
      icon: "👥",
      description: "View and manage member accounts",
      color: "tertiary"
    },
    {
      href: "/officers/reports",
      label: "Generate Reports",
      icon: "📈",
      description: "Create activity and performance reports",
      color: "quaternary"
    }
  ];
  async function loadDashboardStats() {
    try {
      statsLoading = true;
      const { data: pendingData, error: pendingError } = await supabase.from("point_submissions").select("id").neq("approved", true);
      if (pendingError) throw pendingError;
      pendingReviews = pendingData?.length || 0;
      const { data: membersData, error: membersError } = await supabase.from("members").select("id").eq("active", true);
      if (membersError) throw membersError;
      activeMembers = membersData?.length || 0;
      const now = /* @__PURE__ */ new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const { data: pointsData, error: pointsError } = await supabase.from("point_submissions").select("points").gte("submitted_at", firstDayOfMonth.toISOString()).lt("submitted_at", firstDayOfNextMonth.toISOString()).eq("approved", true);
      if (pointsError) throw pointsError;
      pointsThisMonth = pointsData?.reduce((sum, submission) => sum + (submission.points || 0), 0) || 0;
      await competitionManagementStore.loadCompetitions();
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      pendingReviews = 0;
      activeMembers = 0;
      pointsThisMonth = 0;
    } finally {
      statsLoading = false;
    }
  }
  $$result.css.add(css);
  {
    if ($user !== void 0 && $userProfile !== void 0) {
      isLoading = false;
      if (!$user) {
        goto();
      } else if ($userProfile && !$userProfile.is_officer) {
        accessDenied = true;
      } else if ($userProfile && $userProfile.is_officer) {
        accessDenied = false;
        loadDashboardStats();
        competitionManagementStore.initialize();
      }
    }
  }
  {
    if ($competitionManagementStore.stats) {
      activeCompetitions = $competitionManagementStore.stats.active;
      totalCompetitionEntries = $competitionManagementStore.stats.totalEntries;
    }
  }
  $$unsubscribe_competitionManagementStore();
  $$unsubscribe_userProfile();
  $$unsubscribe_user();
  return `${validate_component(Container, "Container").$$render($$result, { size: "lg" }, {}, {
    default: () => {
      return `${isLoading ? `${validate_component(LoadingSpinner, "LoadingSpinner").$$render($$result, { message: "Verifying permissions..." }, {}, {})}` : `${!$user ? `${validate_component(EmptyState, "EmptyState").$$render(
        $$result,
        {
          icon: "🔒",
          title: "Authentication Required",
          message: "Please log in to access officer tools.",
          actionLabel: "Sign In",
          actionHref: "/login"
        },
        {},
        {}
      )}` : `${accessDenied ? `${validate_component(EmptyState, "EmptyState").$$render(
        $$result,
        {
          icon: "⚠️",
          title: "Access Restricted",
          message: "You are not authorized to view this page. Officer privileges are required.",
          actionLabel: "Return Home",
          actionHref: "/"
        },
        {},
        {}
      )}` : `${validate_component(Hero, "Hero").$$render(
        $$result,
        {
          title: "Officer Tools",
          subtitle: "Administrative Dashboard",
          icon: "🍺",
          center: true
        },
        {},
        {}
      )} ${$userProfile?.name ? `<div class="welcome-message svelte-tdgggh"><p class="svelte-tdgggh">Welcome, Officer <strong>${escape($userProfile.name)}</strong>!</p> <p class="access-level svelte-tdgggh" data-svelte-h="svelte-1od60id">You have administrative privileges</p></div>` : ``} <div class="tools-section svelte-tdgggh"><h2 class="svelte-tdgggh" data-svelte-h="svelte-1ewb153">Administrative Tools</h2> <div class="tools-grid svelte-tdgggh">${each(officerTools, (tool) => {
        return `<a${add_attribute("href", tool.href, 0)} class="${"tool-card " + escape(tool.color, true) + " svelte-tdgggh"}"><div class="tool-icon svelte-tdgggh">${escape(tool.icon)}</div> <div class="tool-content svelte-tdgggh"><h3 class="tool-label svelte-tdgggh">${escape(tool.label)}</h3> <p class="tool-description svelte-tdgggh">${escape(tool.description)}</p> ${tool.label === "Manage Competitions" && !$competitionManagementStore.isLoading ? `<div class="tool-stats svelte-tdgggh">${validate_component(Badge, "Badge").$$render($$result, { size: "sm" }, {}, {
          default: () => {
            return `${escape(activeCompetitions)} Active`;
          }
        })} ${validate_component(Badge, "Badge").$$render($$result, { size: "sm" }, {}, {
          default: () => {
            return `${escape(totalCompetitionEntries)} Entries`;
          }
        })} </div>` : ``}</div> <div class="tool-arrow svelte-tdgggh" data-svelte-h="svelte-1rtrb6l">→</div> </a>`;
      })}</div></div> <div class="quick-stats svelte-tdgggh"><h3 class="svelte-tdgggh" data-svelte-h="svelte-1mp6kz2">Quick Overview</h3> <div class="stats-grid svelte-tdgggh"><div class="stat-card svelte-tdgggh"><div class="stat-icon svelte-tdgggh" data-svelte-h="svelte-14idgrf">📝</div> <div class="stat-content svelte-tdgggh"><div class="stat-label svelte-tdgggh" data-svelte-h="svelte-1lvcfee">Pending Reviews</div> <div class="stat-value svelte-tdgggh">${statsLoading ? `<div class="stat-loading svelte-tdgggh"></div>` : `${escape(pendingReviews)}`}</div></div></div> <div class="stat-card svelte-tdgggh"><div class="stat-icon svelte-tdgggh" data-svelte-h="svelte-13mzxv">👥</div> <div class="stat-content svelte-tdgggh"><div class="stat-label svelte-tdgggh" data-svelte-h="svelte-a0c4iz">Active Members</div> <div class="stat-value svelte-tdgggh">${statsLoading ? `<div class="stat-loading svelte-tdgggh"></div>` : `${escape(activeMembers)}`}</div></div></div> <div class="stat-card svelte-tdgggh"><div class="stat-icon svelte-tdgggh" data-svelte-h="svelte-11nbgq0">🆙</div> <div class="stat-content svelte-tdgggh"><div class="stat-label svelte-tdgggh" data-svelte-h="svelte-1gsq0n9">Points This Month</div> <div class="stat-value svelte-tdgggh">${statsLoading ? `<div class="stat-loading svelte-tdgggh"></div>` : `${escape(pointsThisMonth.toLocaleString())}`}</div></div></div> <div class="stat-card svelte-tdgggh"><div class="stat-icon svelte-tdgggh" data-svelte-h="svelte-cwrisn">🏆</div> <div class="stat-content svelte-tdgggh"><div class="stat-label svelte-tdgggh" data-svelte-h="svelte-1vn6wxa">Active Competitions</div> <div class="stat-value svelte-tdgggh">${$competitionManagementStore.isLoading ? `<div class="stat-loading svelte-tdgggh"></div>` : `${escape(activeCompetitions)}`}</div></div></div> <div class="stat-card svelte-tdgggh"><div class="stat-icon svelte-tdgggh" data-svelte-h="svelte-1yllf8j">🍺</div> <div class="stat-content svelte-tdgggh"><div class="stat-label svelte-tdgggh" data-svelte-h="svelte-21kqb1">Competition Entries</div> <div class="stat-value svelte-tdgggh">${$competitionManagementStore.isLoading ? `<div class="stat-loading svelte-tdgggh"></div>` : `${escape(totalCompetitionEntries)}`}</div></div></div></div></div>`}`}`}`;
    }
  })}`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-DhAfNrno.js.map
