import { c as create_ssr_component, a as subscribe, v as validate_component, d as escape, e as each, b as add_attribute } from './ssr-CFMHIens.js';
import { u as user } from './user-DxtT6N6z.js';
import { u as userProfile, l as loadUserProfile } from './userProfile-BAUZwBX2.js';
import { l as loadApprovals } from './approvalsStore-CHiNxnnz.js';
import { l as loadCategoryData } from './categoryStore-D9lRjhjd.js';
import { l as loadLeaderboard } from './leaderboardStore-BZ_ee2Fz.js';
import './supabaseClient-D_8i9Ohq.js';
import { a as activeCompetitions, l as loadCompetitionData } from './bjcpCategoryStore-PCT2-_IN.js';
import { e as entryStats, l as loadMyEntries } from './myCompetitionEntriesStore-BFF7TTtw.js';
import { p as page } from './stores-C-uFbAzB.js';
import { B as Button } from './Button-DfG06A7O.js';
import { H as Hero } from './Hero-B5bq0fDE.js';
import { C as Container } from './Container-C5rGKtUK.js';
import { B as Badge } from './Badge-CAtCSI__.js';
import './index-Ct3aIOD7.js';
import './false-CRHihH2U.js';
import '@supabase/supabase-js';
import './client-C3KLrhj1.js';
import './exports-DKuYoYKl.js';

const version = {
  display: "v1.3.3 (2025-09-30)"
};
const css$1 = {
  code: ".card.svelte-1a48i05{background-color:var(--color-bg-primary);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:var(--space-6);transition:all var(--transition-base)}.card-no-padding.svelte-1a48i05{padding:0}.card-hover.svelte-1a48i05{cursor:pointer}.card-hover.svelte-1a48i05:hover{transform:translateY(-2px);box-shadow:var(--shadow-lg)}.card-accent.svelte-1a48i05{border-left:4px solid}.card-accent-primary.svelte-1a48i05{border-left-color:var(--color-brand-primary)}.card-accent-success.svelte-1a48i05{border-left-color:var(--color-success)}.card-accent-warning.svelte-1a48i05{border-left-color:var(--color-warning)}.card-accent-danger.svelte-1a48i05{border-left-color:var(--color-danger)}.card-accent-info.svelte-1a48i05{border-left-color:var(--color-info)}",
  map: `{"version":3,"file":"Card.svelte","sources":["Card.svelte"],"sourcesContent":["<script>\\r\\n  /**\\r\\n   * Card Component\\r\\n   *\\r\\n   * A container component with consistent styling for content cards.\\r\\n   *\\r\\n   * @prop {boolean} accent - Whether to show left accent border\\r\\n   * @prop {string} accentColor - Color for accent border: 'primary', 'success', 'warning', 'danger', 'info'\\r\\n   * @prop {boolean} noPadding - Remove default padding\\r\\n   * @prop {boolean} hover - Add hover effect\\r\\n   */\\r\\n\\r\\n  export let accent = false;\\r\\n  export let accentColor = 'primary';\\r\\n  export let noPadding = false;\\r\\n  export let hover = false;\\r\\n<\/script>\\r\\n\\r\\n<div\\r\\n  class=\\"card\\"\\r\\n  class:card-accent={accent}\\r\\n  class:card-accent-primary={accent && accentColor === 'primary'}\\r\\n  class:card-accent-success={accent && accentColor === 'success'}\\r\\n  class:card-accent-warning={accent && accentColor === 'warning'}\\r\\n  class:card-accent-danger={accent && accentColor === 'danger'}\\r\\n  class:card-accent-info={accent && accentColor === 'info'}\\r\\n  class:card-no-padding={noPadding}\\r\\n  class:card-hover={hover}\\r\\n  on:click\\r\\n>\\r\\n  <slot />\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  .card {\\r\\n    background-color: var(--color-bg-primary);\\r\\n    border-radius: var(--radius-md);\\r\\n    box-shadow: var(--shadow-md);\\r\\n    padding: var(--space-6);\\r\\n    transition: all var(--transition-base);\\r\\n  }\\r\\n\\r\\n  .card-no-padding {\\r\\n    padding: 0;\\r\\n  }\\r\\n\\r\\n  .card-hover {\\r\\n    cursor: pointer;\\r\\n  }\\r\\n\\r\\n  .card-hover:hover {\\r\\n    transform: translateY(-2px);\\r\\n    box-shadow: var(--shadow-lg);\\r\\n  }\\r\\n\\r\\n  /* Accent border */\\r\\n  .card-accent {\\r\\n    border-left: 4px solid;\\r\\n  }\\r\\n\\r\\n  .card-accent-primary {\\r\\n    border-left-color: var(--color-brand-primary);\\r\\n  }\\r\\n\\r\\n  .card-accent-success {\\r\\n    border-left-color: var(--color-success);\\r\\n  }\\r\\n\\r\\n  .card-accent-warning {\\r\\n    border-left-color: var(--color-warning);\\r\\n  }\\r\\n\\r\\n  .card-accent-danger {\\r\\n    border-left-color: var(--color-danger);\\r\\n  }\\r\\n\\r\\n  .card-accent-info {\\r\\n    border-left-color: var(--color-info);\\r\\n  }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAkCE,oBAAM,CACJ,gBAAgB,CAAE,IAAI,kBAAkB,CAAC,CACzC,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,UAAU,CAAE,IAAI,WAAW,CAAC,CAC5B,OAAO,CAAE,IAAI,SAAS,CAAC,CACvB,UAAU,CAAE,GAAG,CAAC,IAAI,iBAAiB,CACvC,CAEA,+BAAiB,CACf,OAAO,CAAE,CACX,CAEA,0BAAY,CACV,MAAM,CAAE,OACV,CAEA,0BAAW,MAAO,CAChB,SAAS,CAAE,WAAW,IAAI,CAAC,CAC3B,UAAU,CAAE,IAAI,WAAW,CAC7B,CAGA,2BAAa,CACX,WAAW,CAAE,GAAG,CAAC,KACnB,CAEA,mCAAqB,CACnB,iBAAiB,CAAE,IAAI,qBAAqB,CAC9C,CAEA,mCAAqB,CACnB,iBAAiB,CAAE,IAAI,eAAe,CACxC,CAEA,mCAAqB,CACnB,iBAAiB,CAAE,IAAI,eAAe,CACxC,CAEA,kCAAoB,CAClB,iBAAiB,CAAE,IAAI,cAAc,CACvC,CAEA,gCAAkB,CAChB,iBAAiB,CAAE,IAAI,YAAY,CACrC"}`
};
const Card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { accent = false } = $$props;
  let { accentColor = "primary" } = $$props;
  let { noPadding = false } = $$props;
  let { hover = false } = $$props;
  if ($$props.accent === void 0 && $$bindings.accent && accent !== void 0) $$bindings.accent(accent);
  if ($$props.accentColor === void 0 && $$bindings.accentColor && accentColor !== void 0) $$bindings.accentColor(accentColor);
  if ($$props.noPadding === void 0 && $$bindings.noPadding && noPadding !== void 0) $$bindings.noPadding(noPadding);
  if ($$props.hover === void 0 && $$bindings.hover && hover !== void 0) $$bindings.hover(hover);
  $$result.css.add(css$1);
  return `<div class="${[
    "card svelte-1a48i05",
    (accent ? "card-accent" : "") + " " + (accent && accentColor === "primary" ? "card-accent-primary" : "") + " " + (accent && accentColor === "success" ? "card-accent-success" : "") + " " + (accent && accentColor === "warning" ? "card-accent-warning" : "") + " " + (accent && accentColor === "danger" ? "card-accent-danger" : "") + " " + (accent && accentColor === "info" ? "card-accent-info" : "") + " " + (noPadding ? "card-no-padding" : "") + " " + (hover ? "card-hover" : "")
  ].join(" ").trim()}">${slots.default ? slots.default({}) : ``} </div>`;
});
const css = {
  code: "main.svelte-tl0nod.svelte-tl0nod{display:flex;flex-direction:column;min-height:100vh;justify-content:center;padding:var(--space-4) 0;text-align:center}.welcome-content.svelte-tl0nod.svelte-tl0nod{text-align:center}.welcome-content.svelte-tl0nod p.svelte-tl0nod{margin:var(--space-2) 0;color:var(--color-text-primary)}.points-display.svelte-tl0nod.svelte-tl0nod{font-size:var(--font-size-lg);margin-top:var(--space-4) !important}.points-value.svelte-tl0nod.svelte-tl0nod{color:var(--color-brand-primary);font-weight:var(--font-weight-bold);font-size:1.3em}.nav-section.svelte-tl0nod.svelte-tl0nod{margin-top:var(--space-12)}.nav-section.svelte-tl0nod h2.svelte-tl0nod{color:var(--color-text-primary);font-size:var(--font-size-2xl);font-weight:var(--font-weight-semibold);margin-bottom:var(--space-6)}.nav-links.svelte-tl0nod.svelte-tl0nod{display:flex;flex-direction:column;gap:var(--space-4);align-items:stretch}.nav-card.svelte-tl0nod.svelte-tl0nod{display:flex;align-items:center;text-decoration:none;background:linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-brand-primary-light) 100%);color:var(--color-text-primary);border:2px solid var(--color-brand-primary);padding:var(--space-4);border-radius:var(--radius-md);transition:all var(--transition-base);box-shadow:var(--shadow-sm)}.nav-card.svelte-tl0nod.svelte-tl0nod:hover{background-color:var(--color-brand-primary);color:var(--color-text-inverse);transform:translateY(-2px);box-shadow:var(--shadow-lg);border-color:var(--color-brand-primary)}.nav-icon.svelte-tl0nod.svelte-tl0nod{font-size:var(--font-size-2xl);margin-right:var(--space-4);min-width:2rem}.nav-content.svelte-tl0nod.svelte-tl0nod{display:flex;flex-direction:column;align-items:flex-start;text-align:left;flex:1}.nav-label.svelte-tl0nod.svelte-tl0nod{font-weight:var(--font-weight-medium);font-size:var(--font-size-base);margin-bottom:var(--space-1)}.nav-description.svelte-tl0nod.svelte-tl0nod{font-size:var(--font-size-sm);opacity:0.7;transition:opacity var(--transition-base)}.nav-card.svelte-tl0nod:hover .nav-description.svelte-tl0nod{opacity:0.9}.competition-status.svelte-tl0nod.svelte-tl0nod{margin-top:var(--space-2);display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-2)}.status-text.svelte-tl0nod.svelte-tl0nod{font-size:var(--font-size-xs);color:var(--color-text-secondary);font-weight:var(--font-weight-medium)}.nav-card.svelte-tl0nod:hover .status-text.svelte-tl0nod{color:rgba(255, 255, 255, 0.9)}@media(max-width: 480px){main.svelte-tl0nod.svelte-tl0nod{padding:var(--space-16) var(--space-4) var(--space-4);justify-content:flex-start}.nav-section.svelte-tl0nod h2.svelte-tl0nod{font-size:var(--font-size-xl);margin-bottom:var(--space-4)}.nav-links.svelte-tl0nod.svelte-tl0nod{gap:var(--space-3)}.nav-card.svelte-tl0nod.svelte-tl0nod{padding:var(--space-3)}.nav-icon.svelte-tl0nod.svelte-tl0nod{font-size:var(--font-size-xl);margin-right:var(--space-3);min-width:1.75rem}.nav-label.svelte-tl0nod.svelte-tl0nod{font-size:var(--font-size-sm)}.nav-description.svelte-tl0nod.svelte-tl0nod{font-size:var(--font-size-xs)}}@media(min-width: 640px){.nav-links.svelte-tl0nod.svelte-tl0nod{flex-direction:row;justify-content:center;flex-wrap:wrap;gap:var(--space-6)}.nav-card.svelte-tl0nod.svelte-tl0nod{flex-direction:column;text-align:center;padding:var(--space-6);min-width:200px;max-width:250px}.nav-icon.svelte-tl0nod.svelte-tl0nod{font-size:var(--font-size-4xl);margin-right:0;margin-bottom:var(--space-2);min-width:auto}.nav-content.svelte-tl0nod.svelte-tl0nod{align-items:center;text-align:center}.nav-label.svelte-tl0nod.svelte-tl0nod{font-size:var(--font-size-lg)}.nav-description.svelte-tl0nod.svelte-tl0nod{font-size:var(--font-size-base)}.competition-status.svelte-tl0nod.svelte-tl0nod{align-items:center;margin-top:var(--space-3)}}.version-footer.svelte-tl0nod.svelte-tl0nod{text-align:center;padding:var(--space-4);color:var(--color-text-tertiary);font-size:var(--font-size-xs)}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import { user as authUser } from '$lib/stores/user';\\n  import { userProfile, loadUserProfile } from '$lib/stores/userProfile';\\n  import { loadApprovals } from '$lib/stores/approvalsStore';\\n  import { loadCategoryData } from '$lib/stores/categoryStore';\\n  import { loadLeaderboard } from '$lib/stores/leaderboardStore';\\n  import { loadMySubmissions } from '$lib/stores/mySubmissionsStore';\\n  import { loadCompetitionData, activeCompetitions } from '$lib/stores/bjcpCategoryStore';\\n  import { loadMyEntries, entryStats } from '$lib/stores/myCompetitionEntriesStore';\\n  import { page } from '$app/stores';\\n  import { version } from '$lib/version.js';\\n  import { Hero, Card, Button, Badge, Container } from '$lib/components/ui';\\n\\n  $: isLoggedIn = $authUser !== null;\\n  $: isOfficer = $userProfile?.is_officer === true;\\n\\n  // Initial load on login to homepage\\n  $: if ($page.url.pathname === '/' && $authUser?.id) {\\n    loadApprovals(true);\\n    loadCategoryData(true);\\n    loadLeaderboard(true);\\n    loadUserProfile(true);\\n    loadCompetitionData(true); // Load competition data\\n    loadMyEntries(true); // Load user's competition entries\\n  }\\n\\n  // Removed auto-refresh on tab focus - causes issues with Supabase tab switching\\n\\n  // Competition status for display\\n  $: competitionStatus = getCompetitionStatus($activeCompetitions, $entryStats);\\n\\n  function getCompetitionStatus(competitions, stats) {\\n    if (!competitions || competitions.length === 0) {\\n      return { text: 'No active competitions', badge: null };\\n    }\\n    \\n    const activeCount = competitions.length;\\n    const userEntries = stats?.active || 0;\\n    \\n    if (userEntries > 0) {\\n      return { \\n        text: \`\${activeCount} active competition\${activeCount === 1 ? '' : 's'}\`, \\n        badge: \`\${userEntries} \${userEntries === 1 ? 'entry' : 'entries'}\` \\n      };\\n    }\\n    \\n    return { \\n      text: \`\${activeCount} active competition\${activeCount === 1 ? '' : 's'}\`, \\n      badge: 'Enter now!' \\n    };\\n  }\\n\\n  // Navigation items configuration\\n  const navItems = [\\n    { href: '/submit', label: 'Submit Points', icon: '📝', description: 'Submit your brewing achievements' },\\n    { href: '/my-submissions', label: 'My Submissions', icon: '📋', description: 'Track your submission status' },\\n    { href: '/competitions', label: 'Competitions', icon: '🏆', description: 'Enter beer competitions', isCompetition: true },\\n    { href: '/leaderboard', label: 'Leaderboard', icon: '🏅', description: 'See who\\\\'s brewing the best' },\\n    { href: '/profile', label: 'My Profile', icon: '👤', description: 'Manage your account', authRequired: true }\\n  ];\\n\\n  const officerItems = [\\n    { href: '/officers', label: 'Officer Tools', icon: '⚙️', description: 'Admin dashboard', officerRequired: true }\\n  ];\\n\\n  // Filter nav items based on auth status\\n  $: visibleNavItems = navItems.filter(item => {\\n    if (item.authRequired && !isLoggedIn) return false;\\n    return true;\\n  });\\n\\n  $: visibleOfficerItems = officerItems.filter(item => {\\n    if (item.officerRequired && !isOfficer) return false;\\n    return true;\\n  });\\n<\/script>\\n\\n<Container size=\\"sm\\">\\n  <main>\\n    <Hero\\n      title=\\"JAX Member Portal\\"\\n      subtitle=\\"Have Fun Brew Better Beer!\\"\\n      icon=\\"🍻\\"\\n      center={true}\\n    />\\n\\n    {#if isLoggedIn && $userProfile}\\n      <Card accent accentColor=\\"primary\\">\\n        <div class=\\"welcome-content\\">\\n          <p>Welcome back, <strong>{$userProfile.name || 'Brewer'}</strong>!</p>\\n          {#if $userProfile.points}\\n            <p class=\\"points-display\\">\\n              Your current points:\\n              <span class=\\"points-value\\">{$userProfile.points}</span>\\n            </p>\\n          {/if}\\n        </div>\\n      </Card>\\n    {:else if isLoggedIn}\\n      <Card accent accentColor=\\"primary\\">\\n        <div class=\\"welcome-content\\">\\n          <p>Welcome back, Brewer!</p>\\n        </div>\\n      </Card>\\n    {:else}\\n      <Card accent accentColor=\\"primary\\">\\n        <div class=\\"welcome-content\\">\\n          <p>Sign in to track your brewing achievements and compete with fellow brewers!</p>\\n          <Button variant=\\"primary\\" size=\\"lg\\" on:click={() => window.location.href = '/login'}>\\n            Get Started\\n          </Button>\\n        </div>\\n      </Card>\\n    {/if}\\n\\n    <div class=\\"nav-section\\">\\n      <h2>Quick Actions</h2>\\n      <div class=\\"nav-links\\">\\n        {#each visibleNavItems as item}\\n          <a href={item.href} class=\\"nav-card\\">\\n            <span class=\\"nav-icon\\">{item.icon}</span>\\n            <div class=\\"nav-content\\">\\n              <span class=\\"nav-label\\">{item.label}</span>\\n              <span class=\\"nav-description\\">{item.description}</span>\\n              {#if item.isCompetition && isLoggedIn && competitionStatus}\\n                <div class=\\"competition-status\\">\\n                  <span class=\\"status-text\\">{competitionStatus.text}</span>\\n                  {#if competitionStatus.badge}\\n                    <Badge variant=\\"primary\\" size=\\"sm\\">{competitionStatus.badge}</Badge>\\n                  {/if}\\n                </div>\\n              {/if}\\n            </div>\\n          </a>\\n        {/each}\\n\\n        {#each visibleOfficerItems as item}\\n          <a href={item.href} class=\\"nav-card\\">\\n            <span class=\\"nav-icon\\">{item.icon}</span>\\n            <div class=\\"nav-content\\">\\n              <span class=\\"nav-label\\">{item.label}</span>\\n              <span class=\\"nav-description\\">{item.description}</span>\\n            </div>\\n          </a>\\n        {/each}\\n      </div>\\n    </div>\\n  </main>\\n</Container>\\n\\n<style>\\n  main {\\n    display: flex;\\n    flex-direction: column;\\n    min-height: 100vh;\\n    justify-content: center;\\n    padding: var(--space-4) 0;\\n    text-align: center;\\n  }\\n\\n  .welcome-content {\\n    text-align: center;\\n  }\\n\\n  .welcome-content p {\\n    margin: var(--space-2) 0;\\n    color: var(--color-text-primary);\\n  }\\n\\n  .points-display {\\n    font-size: var(--font-size-lg);\\n    margin-top: var(--space-4) !important;\\n  }\\n\\n  .points-value {\\n    color: var(--color-brand-primary);\\n    font-weight: var(--font-weight-bold);\\n    font-size: 1.3em;\\n  }\\n\\n  .nav-section {\\n    margin-top: var(--space-12);\\n  }\\n\\n  .nav-section h2 {\\n    color: var(--color-text-primary);\\n    font-size: var(--font-size-2xl);\\n    font-weight: var(--font-weight-semibold);\\n    margin-bottom: var(--space-6);\\n  }\\n\\n  .nav-links {\\n    display: flex;\\n    flex-direction: column;\\n    gap: var(--space-4);\\n    align-items: stretch;\\n  }\\n\\n  .nav-card {\\n    display: flex;\\n    align-items: center;\\n    text-decoration: none;\\n    background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-brand-primary-light) 100%);\\n    color: var(--color-text-primary);\\n    border: 2px solid var(--color-brand-primary);\\n    padding: var(--space-4);\\n    border-radius: var(--radius-md);\\n    transition: all var(--transition-base);\\n    box-shadow: var(--shadow-sm);\\n  }\\n\\n  .nav-card:hover {\\n    background-color: var(--color-brand-primary);\\n    color: var(--color-text-inverse);\\n    transform: translateY(-2px);\\n    box-shadow: var(--shadow-lg);\\n    border-color: var(--color-brand-primary);\\n  }\\n\\n  .nav-icon {\\n    font-size: var(--font-size-2xl);\\n    margin-right: var(--space-4);\\n    min-width: 2rem;\\n  }\\n\\n  .nav-content {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: flex-start;\\n    text-align: left;\\n    flex: 1;\\n  }\\n\\n  .nav-label {\\n    font-weight: var(--font-weight-medium);\\n    font-size: var(--font-size-base);\\n    margin-bottom: var(--space-1);\\n  }\\n\\n  .nav-description {\\n    font-size: var(--font-size-sm);\\n    opacity: 0.7;\\n    transition: opacity var(--transition-base);\\n  }\\n\\n  .nav-card:hover .nav-description {\\n    opacity: 0.9;\\n  }\\n\\n  .competition-status {\\n    margin-top: var(--space-2);\\n    display: flex;\\n    flex-direction: column;\\n    align-items: flex-start;\\n    gap: var(--space-2);\\n  }\\n\\n  .status-text {\\n    font-size: var(--font-size-xs);\\n    color: var(--color-text-secondary);\\n    font-weight: var(--font-weight-medium);\\n  }\\n\\n  .nav-card:hover .status-text {\\n    color: rgba(255, 255, 255, 0.9);\\n  }\\n\\n  /* Mobile styles */\\n  @media (max-width: 480px) {\\n    main {\\n      padding: var(--space-16) var(--space-4) var(--space-4);\\n      justify-content: flex-start;\\n    }\\n\\n    .nav-section h2 {\\n      font-size: var(--font-size-xl);\\n      margin-bottom: var(--space-4);\\n    }\\n\\n    .nav-links {\\n      gap: var(--space-3);\\n    }\\n\\n    .nav-card {\\n      padding: var(--space-3);\\n    }\\n\\n    .nav-icon {\\n      font-size: var(--font-size-xl);\\n      margin-right: var(--space-3);\\n      min-width: 1.75rem;\\n    }\\n\\n    .nav-label {\\n      font-size: var(--font-size-sm);\\n    }\\n\\n    .nav-description {\\n      font-size: var(--font-size-xs);\\n    }\\n  }\\n\\n  /* Desktop styles */\\n  @media (min-width: 640px) {\\n    .nav-links {\\n      flex-direction: row;\\n      justify-content: center;\\n      flex-wrap: wrap;\\n      gap: var(--space-6);\\n    }\\n\\n    .nav-card {\\n      flex-direction: column;\\n      text-align: center;\\n      padding: var(--space-6);\\n      min-width: 200px;\\n      max-width: 250px;\\n    }\\n\\n    .nav-icon {\\n      font-size: var(--font-size-4xl);\\n      margin-right: 0;\\n      margin-bottom: var(--space-2);\\n      min-width: auto;\\n    }\\n\\n    .nav-content {\\n      align-items: center;\\n      text-align: center;\\n    }\\n\\n    .nav-label {\\n      font-size: var(--font-size-lg);\\n    }\\n\\n    .nav-description {\\n      font-size: var(--font-size-base);\\n    }\\n\\n    .competition-status {\\n      align-items: center;\\n      margin-top: var(--space-3);\\n    }\\n  }\\n\\n  .version-footer {\\n    text-align: center;\\n    padding: var(--space-4);\\n    color: var(--color-text-tertiary);\\n    font-size: var(--font-size-xs);\\n  }\\n</style>\\n\\n<footer class=\\"version-footer\\">\\n  <small>{version.display}</small>\\n</footer>"],"names":[],"mappings":"AAuJE,gCAAK,CACH,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,KAAK,CACjB,eAAe,CAAE,MAAM,CACvB,OAAO,CAAE,IAAI,SAAS,CAAC,CAAC,CAAC,CACzB,UAAU,CAAE,MACd,CAEA,4CAAiB,CACf,UAAU,CAAE,MACd,CAEA,8BAAgB,CAAC,eAAE,CACjB,MAAM,CAAE,IAAI,SAAS,CAAC,CAAC,CAAC,CACxB,KAAK,CAAE,IAAI,oBAAoB,CACjC,CAEA,2CAAgB,CACd,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,UAAU,CAAE,IAAI,SAAS,CAAC,CAAC,UAC7B,CAEA,yCAAc,CACZ,KAAK,CAAE,IAAI,qBAAqB,CAAC,CACjC,WAAW,CAAE,IAAI,kBAAkB,CAAC,CACpC,SAAS,CAAE,KACb,CAEA,wCAAa,CACX,UAAU,CAAE,IAAI,UAAU,CAC5B,CAEA,0BAAY,CAAC,gBAAG,CACd,KAAK,CAAE,IAAI,oBAAoB,CAAC,CAChC,SAAS,CAAE,IAAI,eAAe,CAAC,CAC/B,WAAW,CAAE,IAAI,sBAAsB,CAAC,CACxC,aAAa,CAAE,IAAI,SAAS,CAC9B,CAEA,sCAAW,CACT,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IAAI,SAAS,CAAC,CACnB,WAAW,CAAE,OACf,CAEA,qCAAU,CACR,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,IAAI,CACrB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,IAAI,kBAAkB,CAAC,CAAC,EAAE,CAAC,CAAC,IAAI,2BAA2B,CAAC,CAAC,IAAI,CAAC,CACtG,KAAK,CAAE,IAAI,oBAAoB,CAAC,CAChC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,qBAAqB,CAAC,CAC5C,OAAO,CAAE,IAAI,SAAS,CAAC,CACvB,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,UAAU,CAAE,GAAG,CAAC,IAAI,iBAAiB,CAAC,CACtC,UAAU,CAAE,IAAI,WAAW,CAC7B,CAEA,qCAAS,MAAO,CACd,gBAAgB,CAAE,IAAI,qBAAqB,CAAC,CAC5C,KAAK,CAAE,IAAI,oBAAoB,CAAC,CAChC,SAAS,CAAE,WAAW,IAAI,CAAC,CAC3B,UAAU,CAAE,IAAI,WAAW,CAAC,CAC5B,YAAY,CAAE,IAAI,qBAAqB,CACzC,CAEA,qCAAU,CACR,SAAS,CAAE,IAAI,eAAe,CAAC,CAC/B,YAAY,CAAE,IAAI,SAAS,CAAC,CAC5B,SAAS,CAAE,IACb,CAEA,wCAAa,CACX,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,UAAU,CACvB,UAAU,CAAE,IAAI,CAChB,IAAI,CAAE,CACR,CAEA,sCAAW,CACT,WAAW,CAAE,IAAI,oBAAoB,CAAC,CACtC,SAAS,CAAE,IAAI,gBAAgB,CAAC,CAChC,aAAa,CAAE,IAAI,SAAS,CAC9B,CAEA,4CAAiB,CACf,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,OAAO,CAAE,GAAG,CACZ,UAAU,CAAE,OAAO,CAAC,IAAI,iBAAiB,CAC3C,CAEA,uBAAS,MAAM,CAAC,8BAAiB,CAC/B,OAAO,CAAE,GACX,CAEA,+CAAoB,CAClB,UAAU,CAAE,IAAI,SAAS,CAAC,CAC1B,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,UAAU,CACvB,GAAG,CAAE,IAAI,SAAS,CACpB,CAEA,wCAAa,CACX,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,WAAW,CAAE,IAAI,oBAAoB,CACvC,CAEA,uBAAS,MAAM,CAAC,0BAAa,CAC3B,KAAK,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAChC,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,gCAAK,CACH,OAAO,CAAE,IAAI,UAAU,CAAC,CAAC,IAAI,SAAS,CAAC,CAAC,IAAI,SAAS,CAAC,CACtD,eAAe,CAAE,UACnB,CAEA,0BAAY,CAAC,gBAAG,CACd,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,aAAa,CAAE,IAAI,SAAS,CAC9B,CAEA,sCAAW,CACT,GAAG,CAAE,IAAI,SAAS,CACpB,CAEA,qCAAU,CACR,OAAO,CAAE,IAAI,SAAS,CACxB,CAEA,qCAAU,CACR,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,YAAY,CAAE,IAAI,SAAS,CAAC,CAC5B,SAAS,CAAE,OACb,CAEA,sCAAW,CACT,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,4CAAiB,CACf,SAAS,CAAE,IAAI,cAAc,CAC/B,CACF,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,sCAAW,CACT,cAAc,CAAE,GAAG,CACnB,eAAe,CAAE,MAAM,CACvB,SAAS,CAAE,IAAI,CACf,GAAG,CAAE,IAAI,SAAS,CACpB,CAEA,qCAAU,CACR,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,MAAM,CAClB,OAAO,CAAE,IAAI,SAAS,CAAC,CACvB,SAAS,CAAE,KAAK,CAChB,SAAS,CAAE,KACb,CAEA,qCAAU,CACR,SAAS,CAAE,IAAI,eAAe,CAAC,CAC/B,YAAY,CAAE,CAAC,CACf,aAAa,CAAE,IAAI,SAAS,CAAC,CAC7B,SAAS,CAAE,IACb,CAEA,wCAAa,CACX,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,MACd,CAEA,sCAAW,CACT,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,4CAAiB,CACf,SAAS,CAAE,IAAI,gBAAgB,CACjC,CAEA,+CAAoB,CAClB,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,IAAI,SAAS,CAC3B,CACF,CAEA,2CAAgB,CACd,UAAU,CAAE,MAAM,CAClB,OAAO,CAAE,IAAI,SAAS,CAAC,CACvB,KAAK,CAAE,IAAI,qBAAqB,CAAC,CACjC,SAAS,CAAE,IAAI,cAAc,CAC/B"}`
};
function getCompetitionStatus(competitions, stats) {
  if (!competitions || competitions.length === 0) {
    return {
      text: "No active competitions",
      badge: null
    };
  }
  const activeCount = competitions.length;
  const userEntries = stats?.active || 0;
  if (userEntries > 0) {
    return {
      text: `${activeCount} active competition${activeCount === 1 ? "" : "s"}`,
      badge: `${userEntries} ${userEntries === 1 ? "entry" : "entries"}`
    };
  }
  return {
    text: `${activeCount} active competition${activeCount === 1 ? "" : "s"}`,
    badge: "Enter now!"
  };
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isLoggedIn;
  let isOfficer;
  let competitionStatus;
  let visibleNavItems;
  let visibleOfficerItems;
  let $entryStats, $$unsubscribe_entryStats;
  let $activeCompetitions, $$unsubscribe_activeCompetitions;
  let $authUser, $$unsubscribe_authUser;
  let $page, $$unsubscribe_page;
  let $userProfile, $$unsubscribe_userProfile;
  $$unsubscribe_entryStats = subscribe(entryStats, (value) => $entryStats = value);
  $$unsubscribe_activeCompetitions = subscribe(activeCompetitions, (value) => $activeCompetitions = value);
  $$unsubscribe_authUser = subscribe(user, (value) => $authUser = value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_userProfile = subscribe(userProfile, (value) => $userProfile = value);
  const navItems = [
    {
      href: "/submit",
      label: "Submit Points",
      icon: "📝",
      description: "Submit your brewing achievements"
    },
    {
      href: "/my-submissions",
      label: "My Submissions",
      icon: "📋",
      description: "Track your submission status"
    },
    {
      href: "/competitions",
      label: "Competitions",
      icon: "🏆",
      description: "Enter beer competitions",
      isCompetition: true
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: "🏅",
      description: "See who's brewing the best"
    },
    {
      href: "/profile",
      label: "My Profile",
      icon: "👤",
      description: "Manage your account",
      authRequired: true
    }
  ];
  const officerItems = [
    {
      href: "/officers",
      label: "Officer Tools",
      icon: "⚙️",
      description: "Admin dashboard",
      officerRequired: true
    }
  ];
  $$result.css.add(css);
  isLoggedIn = $authUser !== null;
  isOfficer = $userProfile?.is_officer === true;
  {
    if ($page.url.pathname === "/" && $authUser?.id) {
      loadApprovals(true);
      loadCategoryData(true);
      loadLeaderboard(true);
      loadUserProfile(true);
      loadCompetitionData(true);
      loadMyEntries(true);
    }
  }
  competitionStatus = getCompetitionStatus($activeCompetitions, $entryStats);
  visibleNavItems = navItems.filter((item) => {
    if (item.authRequired && !isLoggedIn) return false;
    return true;
  });
  visibleOfficerItems = officerItems.filter((item) => {
    if (item.officerRequired && !isOfficer) return false;
    return true;
  });
  $$unsubscribe_entryStats();
  $$unsubscribe_activeCompetitions();
  $$unsubscribe_authUser();
  $$unsubscribe_page();
  $$unsubscribe_userProfile();
  return `${validate_component(Container, "Container").$$render($$result, { size: "sm" }, {}, {
    default: () => {
      return `<main class="svelte-tl0nod">${validate_component(Hero, "Hero").$$render(
        $$result,
        {
          title: "JAX Member Portal",
          subtitle: "Have Fun Brew Better Beer!",
          icon: "🍻",
          center: true
        },
        {},
        {}
      )} ${isLoggedIn && $userProfile ? `${validate_component(Card, "Card").$$render($$result, { accent: true, accentColor: "primary" }, {}, {
        default: () => {
          return `<div class="welcome-content svelte-tl0nod"><p class="svelte-tl0nod">Welcome back, <strong>${escape($userProfile.name || "Brewer")}</strong>!</p> ${$userProfile.points ? `<p class="points-display svelte-tl0nod">Your current points:
              <span class="points-value svelte-tl0nod">${escape($userProfile.points)}</span></p>` : ``}</div>`;
        }
      })}` : `${isLoggedIn ? `${validate_component(Card, "Card").$$render($$result, { accent: true, accentColor: "primary" }, {}, {
        default: () => {
          return `<div class="welcome-content svelte-tl0nod" data-svelte-h="svelte-zuvq9n"><p class="svelte-tl0nod">Welcome back, Brewer!</p></div>`;
        }
      })}` : `${validate_component(Card, "Card").$$render($$result, { accent: true, accentColor: "primary" }, {}, {
        default: () => {
          return `<div class="welcome-content svelte-tl0nod"><p class="svelte-tl0nod" data-svelte-h="svelte-5vrdzz">Sign in to track your brewing achievements and compete with fellow brewers!</p> ${validate_component(Button, "Button").$$render($$result, { variant: "primary", size: "lg" }, {}, {
            default: () => {
              return `Get Started`;
            }
          })}</div>`;
        }
      })}`}`} <div class="nav-section svelte-tl0nod"><h2 class="svelte-tl0nod" data-svelte-h="svelte-1yfc9ki">Quick Actions</h2> <div class="nav-links svelte-tl0nod">${each(visibleNavItems, (item) => {
        return `<a${add_attribute("href", item.href, 0)} class="nav-card svelte-tl0nod"><span class="nav-icon svelte-tl0nod">${escape(item.icon)}</span> <div class="nav-content svelte-tl0nod"><span class="nav-label svelte-tl0nod">${escape(item.label)}</span> <span class="nav-description svelte-tl0nod">${escape(item.description)}</span> ${item.isCompetition && isLoggedIn && competitionStatus ? `<div class="competition-status svelte-tl0nod"><span class="status-text svelte-tl0nod">${escape(competitionStatus.text)}</span> ${competitionStatus.badge ? `${validate_component(Badge, "Badge").$$render($$result, { variant: "primary", size: "sm" }, {}, {
          default: () => {
            return `${escape(competitionStatus.badge)}`;
          }
        })}` : ``} </div>` : ``}</div> </a>`;
      })} ${each(visibleOfficerItems, (item) => {
        return `<a${add_attribute("href", item.href, 0)} class="nav-card svelte-tl0nod"><span class="nav-icon svelte-tl0nod">${escape(item.icon)}</span> <div class="nav-content svelte-tl0nod"><span class="nav-label svelte-tl0nod">${escape(item.label)}</span> <span class="nav-description svelte-tl0nod">${escape(item.description)}</span></div> </a>`;
      })}</div></div></main>`;
    }
  })}  <footer class="version-footer svelte-tl0nod"><small>${escape(version.display)}</small></footer>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-D1RPdIlv.js.map
