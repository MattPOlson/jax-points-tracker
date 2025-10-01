import { c as create_ssr_component, o as onDestroy, v as validate_component, d as escape, b as add_attribute } from './ssr-CFMHIens.js';
import './supabaseClient-D_8i9Ohq.js';
import { u as userProfile } from './userProfile-BAUZwBX2.js';
import './Toaster.svelte_svelte_type_style_lang-BKJPPWO5.js';
import { B as Button } from './Button-D8GsU9am.js';
import { H as Hero } from './Modal.svelte_svelte_type_style_lang-CSlcH1CH.js';
import { L as LoadingSpinner } from './LoadingSpinner-Don57TQN.js';
import { E as EmptyState } from './EmptyState-D3cH9tyj.js';
import { C as Container } from './Container-Csj7BZVW.js';
import '@supabase/supabase-js';
import './index-Ct3aIOD7.js';
import './false-CRHihH2U.js';

const css$1 = {
  code: ".form-input-wrapper.svelte-2pnjwa{display:flex;flex-direction:column;gap:var(--space-2)}.full-width.svelte-2pnjwa{width:100%}.form-label.svelte-2pnjwa{font-size:var(--font-size-sm);font-weight:var(--font-weight-medium);color:var(--color-text-primary)}.form-label-required.svelte-2pnjwa::after{content:' *';color:var(--color-danger)}.form-input.svelte-2pnjwa{padding:var(--space-3);border:1px solid var(--color-border-primary);border-radius:var(--radius-md);font-size:var(--font-size-base);color:var(--color-text-primary);background-color:var(--color-bg-primary);transition:border-color var(--transition-fast), box-shadow var(--transition-fast);width:100%}.form-input.svelte-2pnjwa:focus{outline:none;border-color:var(--color-border-focus);box-shadow:0 0 0 3px var(--color-brand-primary-light)}.form-input.svelte-2pnjwa:disabled{background-color:var(--color-bg-tertiary);color:var(--color-text-disabled);cursor:not-allowed}.form-input-error.svelte-2pnjwa{border-color:var(--color-danger)}.form-input-error.svelte-2pnjwa:focus{border-color:var(--color-danger);box-shadow:0 0 0 3px var(--color-danger-light)}.form-error.svelte-2pnjwa{font-size:var(--font-size-sm);color:var(--color-danger);margin:0}.form-helper.svelte-2pnjwa{font-size:var(--font-size-sm);color:var(--color-text-tertiary);margin:0}",
  map: `{"version":3,"file":"FormInput.svelte","sources":["FormInput.svelte"],"sourcesContent":["<script>\\r\\n  /**\\r\\n   * FormInput Component\\r\\n   *\\r\\n   * A styled input field with label, error message, and helper text support.\\r\\n   *\\r\\n   * @prop {string} id - Input ID (also used for label 'for' attribute)\\r\\n   * @prop {string} label - Label text\\r\\n   * @prop {string} type - Input type (text, email, password, number, tel, date, etc.)\\r\\n   * @prop {string} value - Input value\\r\\n   * @prop {string} placeholder - Placeholder text\\r\\n   * @prop {boolean} required - Whether the input is required\\r\\n   * @prop {boolean} disabled - Whether the input is disabled\\r\\n   * @prop {string} error - Error message to display\\r\\n   * @prop {string} helper - Helper text to display\\r\\n   * @prop {boolean} fullWidth - Whether input should take full width (default: true)\\r\\n   */\\r\\n\\r\\n  export let id;\\r\\n  export let label;\\r\\n  export let type = 'text';\\r\\n  export let value = '';\\r\\n  export let placeholder = '';\\r\\n  export let required = false;\\r\\n  export let disabled = false;\\r\\n  export let error = '';\\r\\n  export let helper = '';\\r\\n  export let fullWidth = true;\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"form-input-wrapper\\" class:full-width={fullWidth}>\\r\\n  {#if label}\\r\\n    <label for={id} class=\\"form-label\\" class:form-label-required={required}>\\r\\n      {label}\\r\\n    </label>\\r\\n  {/if}\\r\\n  <input\\r\\n    {id}\\r\\n    type={type}\\r\\n    {placeholder}\\r\\n    {required}\\r\\n    {disabled}\\r\\n    value={value}\\r\\n    class=\\"form-input\\"\\r\\n    class:form-input-error={error}\\r\\n    on:input={(e) => value = e.target.value}\\r\\n    on:change\\r\\n    on:blur\\r\\n    on:focus\\r\\n  />\\r\\n  {#if error}\\r\\n    <p class=\\"form-error\\">{error}</p>\\r\\n  {:else if helper}\\r\\n    <p class=\\"form-helper\\">{helper}</p>\\r\\n  {/if}\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  .form-input-wrapper {\\r\\n    display: flex;\\r\\n    flex-direction: column;\\r\\n    gap: var(--space-2);\\r\\n  }\\r\\n\\r\\n  .full-width {\\r\\n    width: 100%;\\r\\n  }\\r\\n\\r\\n  .form-label {\\r\\n    font-size: var(--font-size-sm);\\r\\n    font-weight: var(--font-weight-medium);\\r\\n    color: var(--color-text-primary);\\r\\n  }\\r\\n\\r\\n  .form-label-required::after {\\r\\n    content: ' *';\\r\\n    color: var(--color-danger);\\r\\n  }\\r\\n\\r\\n  .form-input {\\r\\n    padding: var(--space-3);\\r\\n    border: 1px solid var(--color-border-primary);\\r\\n    border-radius: var(--radius-md);\\r\\n    font-size: var(--font-size-base);\\r\\n    color: var(--color-text-primary);\\r\\n    background-color: var(--color-bg-primary);\\r\\n    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);\\r\\n    width: 100%;\\r\\n  }\\r\\n\\r\\n  .form-input:focus {\\r\\n    outline: none;\\r\\n    border-color: var(--color-border-focus);\\r\\n    box-shadow: 0 0 0 3px var(--color-brand-primary-light);\\r\\n  }\\r\\n\\r\\n  .form-input:disabled {\\r\\n    background-color: var(--color-bg-tertiary);\\r\\n    color: var(--color-text-disabled);\\r\\n    cursor: not-allowed;\\r\\n  }\\r\\n\\r\\n  .form-input-error {\\r\\n    border-color: var(--color-danger);\\r\\n  }\\r\\n\\r\\n  .form-input-error:focus {\\r\\n    border-color: var(--color-danger);\\r\\n    box-shadow: 0 0 0 3px var(--color-danger-light);\\r\\n  }\\r\\n\\r\\n  .form-error {\\r\\n    font-size: var(--font-size-sm);\\r\\n    color: var(--color-danger);\\r\\n    margin: 0;\\r\\n  }\\r\\n\\r\\n  .form-helper {\\r\\n    font-size: var(--font-size-sm);\\r\\n    color: var(--color-text-tertiary);\\r\\n    margin: 0;\\r\\n  }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AA0DE,iCAAoB,CAClB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IAAI,SAAS,CACpB,CAEA,yBAAY,CACV,KAAK,CAAE,IACT,CAEA,yBAAY,CACV,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,WAAW,CAAE,IAAI,oBAAoB,CAAC,CACtC,KAAK,CAAE,IAAI,oBAAoB,CACjC,CAEA,kCAAoB,OAAQ,CAC1B,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,cAAc,CAC3B,CAEA,yBAAY,CACV,OAAO,CAAE,IAAI,SAAS,CAAC,CACvB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,sBAAsB,CAAC,CAC7C,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,SAAS,CAAE,IAAI,gBAAgB,CAAC,CAChC,KAAK,CAAE,IAAI,oBAAoB,CAAC,CAChC,gBAAgB,CAAE,IAAI,kBAAkB,CAAC,CACzC,UAAU,CAAE,YAAY,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAAC,UAAU,CAAC,IAAI,iBAAiB,CAAC,CAClF,KAAK,CAAE,IACT,CAEA,yBAAW,MAAO,CAChB,OAAO,CAAE,IAAI,CACb,YAAY,CAAE,IAAI,oBAAoB,CAAC,CACvC,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,IAAI,2BAA2B,CACvD,CAEA,yBAAW,SAAU,CACnB,gBAAgB,CAAE,IAAI,mBAAmB,CAAC,CAC1C,KAAK,CAAE,IAAI,qBAAqB,CAAC,CACjC,MAAM,CAAE,WACV,CAEA,+BAAkB,CAChB,YAAY,CAAE,IAAI,cAAc,CAClC,CAEA,+BAAiB,MAAO,CACtB,YAAY,CAAE,IAAI,cAAc,CAAC,CACjC,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,IAAI,oBAAoB,CAChD,CAEA,yBAAY,CACV,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,KAAK,CAAE,IAAI,cAAc,CAAC,CAC1B,MAAM,CAAE,CACV,CAEA,0BAAa,CACX,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,KAAK,CAAE,IAAI,qBAAqB,CAAC,CACjC,MAAM,CAAE,CACV"}`
};
const FormInput = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { id } = $$props;
  let { label } = $$props;
  let { type = "text" } = $$props;
  let { value = "" } = $$props;
  let { placeholder = "" } = $$props;
  let { required = false } = $$props;
  let { disabled = false } = $$props;
  let { error = "" } = $$props;
  let { helper = "" } = $$props;
  let { fullWidth = true } = $$props;
  if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0) $$bindings.label(label);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0) $$bindings.placeholder(placeholder);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0) $$bindings.required(required);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
  if ($$props.helper === void 0 && $$bindings.helper && helper !== void 0) $$bindings.helper(helper);
  if ($$props.fullWidth === void 0 && $$bindings.fullWidth && fullWidth !== void 0) $$bindings.fullWidth(fullWidth);
  $$result.css.add(css$1);
  return `<div class="${["form-input-wrapper svelte-2pnjwa", fullWidth ? "full-width" : ""].join(" ").trim()}">${label ? `<label${add_attribute("for", id, 0)} class="${["form-label svelte-2pnjwa", required ? "form-label-required" : ""].join(" ").trim()}">${escape(label)}</label>` : ``} <input${add_attribute("id", id, 0)}${add_attribute("type", type, 0)}${add_attribute("placeholder", placeholder, 0)} ${required ? "required" : ""} ${disabled ? "disabled" : ""}${add_attribute("value", value, 0)} class="${["form-input svelte-2pnjwa", error ? "form-input-error" : ""].join(" ").trim()}"> ${error ? `<p class="form-error svelte-2pnjwa">${escape(error)}</p>` : `${helper ? `<p class="form-helper svelte-2pnjwa">${escape(helper)}</p>` : ``}`} </div>`;
});
const css = {
  code: ".profile-container.svelte-74a9qi.svelte-74a9qi{display:flex;flex-direction:column;gap:2rem;text-align:left}.profile-header.svelte-74a9qi.svelte-74a9qi{background:white;border-radius:6px;padding:2rem;box-shadow:0 4px 6px rgba(0, 0, 0, 0.1);border-left:4px solid #ff3e00;display:flex;align-items:center;gap:1.5rem}.avatar.svelte-74a9qi.svelte-74a9qi{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg, #ff3e00 0%, #e63600 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:white;flex-shrink:0}.header-info.svelte-74a9qi h2.svelte-74a9qi{color:#333;font-size:1.75rem;font-weight:600;margin:0 0 0.5rem 0;text-transform:none}.member-since.svelte-74a9qi.svelte-74a9qi{color:#666;margin:0 0 0.5rem 0;font-size:1rem}.officer-badge.svelte-74a9qi.svelte-74a9qi{background:linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);color:#d97706;padding:0.25rem 0.75rem;border-radius:12px;font-size:0.8rem;font-weight:600;display:inline-block}.form-section.svelte-74a9qi.svelte-74a9qi{background:white;border-radius:6px;padding:2rem;box-shadow:0 4px 6px rgba(0, 0, 0, 0.1)}.form-section.svelte-74a9qi h3.svelte-74a9qi{color:#333;font-size:1.25rem;font-weight:600;margin:0 0 1.5rem 0;text-transform:none}.form-grid.svelte-74a9qi.svelte-74a9qi{display:grid;gap:var(--space-6);margin-bottom:var(--space-8)}.form-actions.svelte-74a9qi.svelte-74a9qi{display:flex;gap:var(--space-4);justify-content:flex-start}.button-spinner.svelte-74a9qi.svelte-74a9qi{width:16px;height:16px;border:2px solid rgba(255, 255, 255, 0.3);border-top:2px solid white;border-radius:50%;animation:spin 1s linear infinite}.info-section.svelte-74a9qi.svelte-74a9qi{background:white;border-radius:6px;padding:2rem;box-shadow:0 4px 6px rgba(0, 0, 0, 0.1)}.info-section.svelte-74a9qi h3.svelte-74a9qi{color:#333;font-size:1.25rem;font-weight:600;margin:0 0 1.5rem 0;text-transform:none}.info-grid.svelte-74a9qi.svelte-74a9qi{display:grid;gap:1rem}.info-item.svelte-74a9qi.svelte-74a9qi{display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid #f1f5f9}.info-item.svelte-74a9qi.svelte-74a9qi:last-child{border-bottom:none}.info-label.svelte-74a9qi.svelte-74a9qi{font-weight:500;color:#666}.info-value.svelte-74a9qi.svelte-74a9qi{font-weight:600;color:#333}.points-item.svelte-74a9qi.svelte-74a9qi{background:linear-gradient(135deg, #fff 0%, #fef7f0 100%);border:1px solid #ff3e00;border-radius:6px;padding:1rem;margin-top:0.5rem}.points-value.svelte-74a9qi.svelte-74a9qi{color:#ff3e00;font-size:1.2rem}.status-active.svelte-74a9qi.svelte-74a9qi{color:#059669}@media(max-width: 768px){.profile-header.svelte-74a9qi.svelte-74a9qi{flex-direction:column;text-align:center;gap:1rem}.avatar.svelte-74a9qi.svelte-74a9qi{width:60px;height:60px;font-size:1.5rem}.header-info.svelte-74a9qi h2.svelte-74a9qi{font-size:1.5rem}.form-section.svelte-74a9qi.svelte-74a9qi,.info-section.svelte-74a9qi.svelte-74a9qi{padding:1.5rem}.form-actions.svelte-74a9qi.svelte-74a9qi{flex-direction:column}.info-item.svelte-74a9qi.svelte-74a9qi{flex-direction:column;align-items:flex-start;gap:0.25rem}}@media(min-width: 640px){.form-grid.svelte-74a9qi.svelte-74a9qi{grid-template-columns:repeat(2, 1fr)}.info-grid.svelte-74a9qi.svelte-74a9qi{grid-template-columns:repeat(2, 1fr)}}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import { onMount, onDestroy } from 'svelte';\\n  import { supabase } from '$lib/supabaseClient';\\n  import { userProfile } from '$lib/stores/userProfile';\\n  import toast from 'svelte-french-toast';\\n  import { Hero, Container, LoadingSpinner, EmptyState, Button, FormInput } from '$lib/components/ui';\\n\\n  // Local copies of profile fields for editing\\n  let profile = null;\\n  let editedName = '';\\n  let editedPhone = '';\\n  let loading = true;\\n  let isUpdating = false;\\n  let cleanupFunctions = [];\\n\\n  // Removed tab focus handler - causes issues with Supabase tab switching\\n  function setupEventHandlers() {\\n    // Tab visibility handling removed for better Supabase compatibility\\n    return () => {\\n      // No cleanup needed now\\n    };\\n  }\\n\\n  // Subscribe to userProfile store\\n  const unsubscribe = userProfile.subscribe((val) => {\\n    if (val) {\\n      profile = val;\\n      editedName = val.name ?? '';\\n      editedPhone = val.phone ?? '';\\n      loading = false;\\n    } else {\\n      profile = null;\\n      editedName = '';\\n      editedPhone = '';\\n      loading = false;\\n    }\\n  });\\n\\n  // Check if anything has changed\\n  $: isDirty = profile && \\n    (editedName !== (profile.name ?? '') || \\n     editedPhone !== (profile.phone ?? ''));\\n\\n  // Format date helper\\n  function formatDate(dateString) {\\n    if (!dateString) return 'N/A';\\n    try {\\n      // Handle space-separated datetime format (e.g., \\"2025-08-29 03:43:21.894974\\")\\n      let isoString = dateString;\\n      if (dateString.includes(' ') && !dateString.includes('T')) {\\n        // Replace space with 'T' and add timezone if missing\\n        isoString = dateString.replace(' ', 'T');\\n        if (!isoString.includes('+') && !isoString.includes('Z')) {\\n          // Assume local timezone if no timezone specified\\n          isoString += 'Z';\\n        }\\n      }\\n\\n      const date = new Date(isoString);\\n      // Check if date is valid\\n      if (isNaN(date.getTime())) {\\n        console.warn('Invalid date after parsing:', dateString, '->', isoString);\\n        return 'Invalid Date';\\n      }\\n\\n      return date.toLocaleDateString('en-US', {\\n        year: 'numeric',\\n        month: 'long',\\n        day: 'numeric'\\n      });\\n    } catch {\\n      return 'Invalid Date';\\n    }\\n  }\\n\\n  // Format datetime helper\\n  function formatDateTime(dateString) {\\n    if (!dateString) return 'N/A';\\n    try {\\n      // Handle space-separated datetime format (e.g., \\"2025-08-29 03:43:21.894974\\")\\n      let isoString = dateString;\\n      if (dateString.includes(' ') && !dateString.includes('T')) {\\n        // Replace space with 'T' and add timezone if missing\\n        isoString = dateString.replace(' ', 'T');\\n        if (!isoString.includes('+') && !isoString.includes('Z')) {\\n          // Assume local timezone if no timezone specified\\n          isoString += 'Z';\\n        }\\n      }\\n\\n      const date = new Date(isoString);\\n      // Check if date is valid\\n      if (isNaN(date.getTime())) {\\n        console.warn('Invalid datetime after parsing:', dateString, '->', isoString);\\n        return 'Invalid Date';\\n      }\\n\\n      return date.toLocaleString('en-US', {\\n        year: 'numeric',\\n        month: 'short',\\n        day: 'numeric',\\n        hour: '2-digit',\\n        minute: '2-digit'\\n      });\\n    } catch {\\n      return 'Invalid Date';\\n    }\\n  }\\n\\n  // Update profile function\\n  async function updateProfile() {\\n    if (!profile || isUpdating) return;\\n\\n    // Validate inputs\\n    if (!editedName.trim()) {\\n      toast.error('Name cannot be empty');\\n      return;\\n    }\\n\\n    isUpdating = true;\\n\\n    try {\\n      const updates = {\\n        name: editedName.trim(),\\n        phone: editedPhone.trim() || null\\n      };\\n\\n      const { data, error } = await supabase\\n        .from('members')\\n        .update(updates)\\n        .eq('id', profile.id)\\n        .select()\\n        .single();\\n\\n      if (error) throw error;\\n\\n      toast.success('✅ Profile updated successfully!');\\n      userProfile.set(data);\\n    } catch (error) {\\n      console.error('Failed to update profile:', error);\\n      toast.error('Failed to update profile. Please try again.');\\n    } finally {\\n      isUpdating = false;\\n    }\\n  }\\n\\n  // Reset changes\\n  function resetChanges() {\\n    if (profile) {\\n      editedName = profile.name ?? '';\\n      editedPhone = profile.phone ?? '';\\n      toast.success('Changes reset');\\n    }\\n  }\\n\\n  onMount(() => {\\n    // Setup tab focus handling\\n    const cleanup = setupEventHandlers();\\n    cleanupFunctions.push(cleanup);\\n  });\\n\\n  onDestroy(() => {\\n    // Cleanup subscriptions and event listeners\\n    unsubscribe();\\n    cleanupFunctions.forEach(cleanup => cleanup());\\n  });\\n<\/script>\\n\\n<Container size=\\"md\\">\\n  <Hero title=\\"My Profile\\" subtitle=\\"Manage your account information\\" icon=\\"👤\\" center={true} />\\n\\n  {#if loading}\\n    <LoadingSpinner message=\\"Loading your profile...\\" />\\n  {:else if profile}\\n    <div class=\\"profile-container\\">\\n      <!-- Profile Header -->\\n      <div class=\\"profile-header\\">\\n        <div class=\\"avatar\\">\\n          <span class=\\"avatar-text\\">{(profile.name || 'U')[0].toUpperCase()}</span>\\n        </div>\\n        <div class=\\"header-info\\">\\n          <h2>{profile.name || 'Member'}</h2>\\n          <p class=\\"member-since\\">Member since {formatDate(profile.join_date)}</p>\\n          {#if profile.is_officer}\\n            <span class=\\"officer-badge\\">🏅 Officer</span>\\n          {/if}\\n        </div>\\n      </div>\\n\\n      <!-- Editable Fields -->\\n      <div class=\\"form-section\\">\\n        <h3>✏️ Edit Information</h3>\\n        <div class=\\"form-grid\\">\\n          <FormInput\\n            id=\\"name\\"\\n            label=\\"Full Name\\"\\n            type=\\"text\\"\\n            bind:value={editedName}\\n            placeholder=\\"Enter your full name\\"\\n            disabled={isUpdating}\\n            required\\n          />\\n\\n          <FormInput\\n            id=\\"phone\\"\\n            label=\\"Phone Number\\"\\n            type=\\"tel\\"\\n            bind:value={editedPhone}\\n            placeholder=\\"(555) 123-4567\\"\\n            disabled={isUpdating}\\n          />\\n        </div>\\n\\n        {#if isDirty}\\n          <div class=\\"form-actions\\">\\n            <Button\\n              on:click={updateProfile}\\n              variant=\\"primary\\"\\n              disabled={isUpdating}\\n            >\\n              {#if isUpdating}\\n                <span class=\\"button-spinner\\"></span>\\n                Saving...\\n              {:else}\\n                💾 Save Changes\\n              {/if}\\n            </Button>\\n            <Button\\n              on:click={resetChanges}\\n              variant=\\"secondary\\"\\n              disabled={isUpdating}\\n            >\\n              ↶ Reset\\n            </Button>\\n          </div>\\n        {/if}\\n      </div>\\n\\n      <!-- Read-Only Information -->\\n      <div class=\\"info-section\\">\\n        <h3>📋 Account Details</h3>\\n        <div class=\\"info-grid\\">\\n          <div class=\\"info-item\\">\\n            <span class=\\"info-label\\">Email Address</span>\\n            <span class=\\"info-value\\">{profile.email}</span>\\n          </div>\\n\\n          <div class=\\"info-item\\">\\n            <span class=\\"info-label\\">Member ID</span>\\n            <span class=\\"info-value\\">{profile.id.slice(0, 8)}...</span>\\n          </div>\\n\\n          <div class=\\"info-item\\">\\n            <span class=\\"info-label\\">Join Date</span>\\n            <span class=\\"info-value\\">{formatDate(profile.join_date)}</span>\\n          </div>\\n\\n          <div class=\\"info-item\\">\\n            <span class=\\"info-label\\">Last Login</span>\\n            <span class=\\"info-value\\">{formatDateTime(profile.last_login_at)}</span>\\n          </div>\\n\\n          <div class=\\"info-item\\">\\n            <span class=\\"info-label\\">Account Status</span>\\n            <span class=\\"info-value status-active\\">\\n              {profile.active ? '✅ Active' : '❌ Inactive'}\\n            </span>\\n          </div>\\n\\n          {#if profile.points !== undefined}\\n            <div class=\\"info-item points-item\\">\\n              <span class=\\"info-label\\">Total Points</span>\\n              <span class=\\"info-value points-value\\">{profile.points?.toLocaleString() || 0}</span>\\n            </div>\\n          {/if}\\n        </div>\\n      </div>\\n    </div>\\n  {:else}\\n    <EmptyState\\n      icon=\\"🔒\\"\\n      title=\\"Not Logged In\\"\\n      message=\\"Please log in to view your profile information.\\"\\n      actionLabel=\\"Sign In\\"\\n      actionHref=\\"/login\\"\\n    />\\n  {/if}\\n</Container>\\n\\n<style>\\n\\n  .profile-container {\\n    display: flex;\\n    flex-direction: column;\\n    gap: 2rem;\\n    text-align: left;\\n  }\\n\\n  /* Profile Header */\\n  .profile-header {\\n    background: white;\\n    border-radius: 6px;\\n    padding: 2rem;\\n    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\\n    border-left: 4px solid #ff3e00;\\n    display: flex;\\n    align-items: center;\\n    gap: 1.5rem;\\n  }\\n\\n  .avatar {\\n    width: 80px;\\n    height: 80px;\\n    border-radius: 50%;\\n    background: linear-gradient(135deg, #ff3e00 0%, #e63600 100%);\\n    display: flex;\\n    align-items: center;\\n    justify-content: center;\\n    font-size: 2rem;\\n    font-weight: 700;\\n    color: white;\\n    flex-shrink: 0;\\n  }\\n\\n  .header-info h2 {\\n    color: #333;\\n    font-size: 1.75rem;\\n    font-weight: 600;\\n    margin: 0 0 0.5rem 0;\\n    text-transform: none;\\n  }\\n\\n  .member-since {\\n    color: #666;\\n    margin: 0 0 0.5rem 0;\\n    font-size: 1rem;\\n  }\\n\\n  .officer-badge {\\n    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);\\n    color: #d97706;\\n    padding: 0.25rem 0.75rem;\\n    border-radius: 12px;\\n    font-size: 0.8rem;\\n    font-weight: 600;\\n    display: inline-block;\\n  }\\n\\n  /* Form Section */\\n  .form-section {\\n    background: white;\\n    border-radius: 6px;\\n    padding: 2rem;\\n    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .form-section h3 {\\n    color: #333;\\n    font-size: 1.25rem;\\n    font-weight: 600;\\n    margin: 0 0 1.5rem 0;\\n    text-transform: none;\\n  }\\n\\n  .form-grid {\\n    display: grid;\\n    gap: var(--space-6);\\n    margin-bottom: var(--space-8);\\n  }\\n\\n  .form-actions {\\n    display: flex;\\n    gap: var(--space-4);\\n    justify-content: flex-start;\\n  }\\n\\n  .button-spinner {\\n    width: 16px;\\n    height: 16px;\\n    border: 2px solid rgba(255, 255, 255, 0.3);\\n    border-top: 2px solid white;\\n    border-radius: 50%;\\n    animation: spin 1s linear infinite;\\n  }\\n\\n  /* Info Section */\\n  .info-section {\\n    background: white;\\n    border-radius: 6px;\\n    padding: 2rem;\\n    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .info-section h3 {\\n    color: #333;\\n    font-size: 1.25rem;\\n    font-weight: 600;\\n    margin: 0 0 1.5rem 0;\\n    text-transform: none;\\n  }\\n\\n  .info-grid {\\n    display: grid;\\n    gap: 1rem;\\n  }\\n\\n  .info-item {\\n    display: flex;\\n    justify-content: space-between;\\n    align-items: center;\\n    padding: 0.75rem 0;\\n    border-bottom: 1px solid #f1f5f9;\\n  }\\n\\n  .info-item:last-child {\\n    border-bottom: none;\\n  }\\n\\n  .info-label {\\n    font-weight: 500;\\n    color: #666;\\n  }\\n\\n  .info-value {\\n    font-weight: 600;\\n    color: #333;\\n  }\\n\\n  .points-item {\\n    background: linear-gradient(135deg, #fff 0%, #fef7f0 100%);\\n    border: 1px solid #ff3e00;\\n    border-radius: 6px;\\n    padding: 1rem;\\n    margin-top: 0.5rem;\\n  }\\n\\n  .points-value {\\n    color: #ff3e00;\\n    font-size: 1.2rem;\\n  }\\n\\n  .status-active {\\n    color: #059669;\\n  }\\n\\n\\n  /* Mobile Responsive */\\n  @media (max-width: 768px) {\\n\\n    .profile-header {\\n      flex-direction: column;\\n      text-align: center;\\n      gap: 1rem;\\n    }\\n\\n    .avatar {\\n      width: 60px;\\n      height: 60px;\\n      font-size: 1.5rem;\\n    }\\n\\n    .header-info h2 {\\n      font-size: 1.5rem;\\n    }\\n\\n    .form-section,\\n    .info-section {\\n      padding: 1.5rem;\\n    }\\n\\n    .form-actions {\\n      flex-direction: column;\\n    }\\n\\n    .info-item {\\n      flex-direction: column;\\n      align-items: flex-start;\\n      gap: 0.25rem;\\n    }\\n  }\\n\\n  @media (min-width: 640px) {\\n    .form-grid {\\n      grid-template-columns: repeat(2, 1fr);\\n    }\\n\\n    .info-grid {\\n      grid-template-columns: repeat(2, 1fr);\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AAmSE,8CAAmB,CACjB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IAAI,CACT,UAAU,CAAE,IACd,CAGA,2CAAgB,CACd,UAAU,CAAE,KAAK,CACjB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACxC,WAAW,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CAC9B,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,MACP,CAEA,mCAAQ,CACN,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAC7D,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,KAAK,CACZ,WAAW,CAAE,CACf,CAEA,0BAAY,CAAC,gBAAG,CACd,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACpB,cAAc,CAAE,IAClB,CAEA,yCAAc,CACZ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACpB,SAAS,CAAE,IACb,CAEA,0CAAe,CACb,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAC7D,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,OAAO,CAAC,OAAO,CACxB,aAAa,CAAE,IAAI,CACnB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GAAG,CAChB,OAAO,CAAE,YACX,CAGA,yCAAc,CACZ,UAAU,CAAE,KAAK,CACjB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CACzC,CAEA,2BAAa,CAAC,gBAAG,CACf,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACpB,cAAc,CAAE,IAClB,CAEA,sCAAW,CACT,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IAAI,SAAS,CAAC,CACnB,aAAa,CAAE,IAAI,SAAS,CAC9B,CAEA,yCAAc,CACZ,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IAAI,SAAS,CAAC,CACnB,eAAe,CAAE,UACnB,CAEA,2CAAgB,CACd,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAC1C,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,CAC3B,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,IAAI,CAAC,EAAE,CAAC,MAAM,CAAC,QAC5B,CAGA,yCAAc,CACZ,UAAU,CAAE,KAAK,CACjB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CACzC,CAEA,2BAAa,CAAC,gBAAG,CACf,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACpB,cAAc,CAAE,IAClB,CAEA,sCAAW,CACT,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IACP,CAEA,sCAAW,CACT,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,OAAO,CAAC,CAAC,CAClB,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,OAC3B,CAEA,sCAAU,WAAY,CACpB,aAAa,CAAE,IACjB,CAEA,uCAAY,CACV,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IACT,CAEA,uCAAY,CACV,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IACT,CAEA,wCAAa,CACX,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,IAAI,CAAC,EAAE,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAC1D,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CACzB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,MACd,CAEA,yCAAc,CACZ,KAAK,CAAE,OAAO,CACd,SAAS,CAAE,MACb,CAEA,0CAAe,CACb,KAAK,CAAE,OACT,CAIA,MAAO,YAAY,KAAK,CAAE,CAExB,2CAAgB,CACd,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,MAAM,CAClB,GAAG,CAAE,IACP,CAEA,mCAAQ,CACN,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,SAAS,CAAE,MACb,CAEA,0BAAY,CAAC,gBAAG,CACd,SAAS,CAAE,MACb,CAEA,yCAAa,CACb,yCAAc,CACZ,OAAO,CAAE,MACX,CAEA,yCAAc,CACZ,cAAc,CAAE,MAClB,CAEA,sCAAW,CACT,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,UAAU,CACvB,GAAG,CAAE,OACP,CACF,CAEA,MAAO,YAAY,KAAK,CAAE,CACxB,sCAAW,CACT,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CACtC,CAEA,sCAAW,CACT,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CACtC,CACF"}`
};
function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    let isoString = dateString;
    if (dateString.includes(" ") && !dateString.includes("T")) {
      isoString = dateString.replace(" ", "T");
      if (!isoString.includes("+") && !isoString.includes("Z")) {
        isoString += "Z";
      }
    }
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date after parsing:", dateString, "->", isoString);
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return "Invalid Date";
  }
}
function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  try {
    let isoString = dateString;
    if (dateString.includes(" ") && !dateString.includes("T")) {
      isoString = dateString.replace(" ", "T");
      if (!isoString.includes("+") && !isoString.includes("Z")) {
        isoString += "Z";
      }
    }
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid datetime after parsing:", dateString, "->", isoString);
      return "Invalid Date";
    }
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "Invalid Date";
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isDirty;
  let profile = null;
  let editedName = "";
  let editedPhone = "";
  let loading = true;
  let isUpdating = false;
  let cleanupFunctions = [];
  const unsubscribe = userProfile.subscribe((val) => {
    if (val) {
      profile = val;
      editedName = val.name ?? "";
      editedPhone = val.phone ?? "";
      loading = false;
    } else {
      profile = null;
      editedName = "";
      editedPhone = "";
      loading = false;
    }
  });
  onDestroy(() => {
    unsubscribe();
    cleanupFunctions.forEach((cleanup) => cleanup());
  });
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    isDirty = profile && (editedName !== (profile.name ?? "") || editedPhone !== (profile.phone ?? ""));
    $$rendered = `${validate_component(Container, "Container").$$render($$result, { size: "md" }, {}, {
      default: () => {
        return `${validate_component(Hero, "Hero").$$render(
          $$result,
          {
            title: "My Profile",
            subtitle: "Manage your account information",
            icon: "👤",
            center: true
          },
          {},
          {}
        )} ${loading ? `${validate_component(LoadingSpinner, "LoadingSpinner").$$render($$result, { message: "Loading your profile..." }, {}, {})}` : `${profile ? `<div class="profile-container svelte-74a9qi"> <div class="profile-header svelte-74a9qi"><div class="avatar svelte-74a9qi"><span class="avatar-text">${escape((profile.name || "U")[0].toUpperCase())}</span></div> <div class="header-info svelte-74a9qi"><h2 class="svelte-74a9qi">${escape(profile.name || "Member")}</h2> <p class="member-since svelte-74a9qi">Member since ${escape(formatDate(profile.join_date))}</p> ${profile.is_officer ? `<span class="officer-badge svelte-74a9qi" data-svelte-h="svelte-1me08f8">🏅 Officer</span>` : ``}</div></div>  <div class="form-section svelte-74a9qi"><h3 class="svelte-74a9qi" data-svelte-h="svelte-1s4nm9i">✏️ Edit Information</h3> <div class="form-grid svelte-74a9qi">${validate_component(FormInput, "FormInput").$$render(
          $$result,
          {
            id: "name",
            label: "Full Name",
            type: "text",
            placeholder: "Enter your full name",
            disabled: isUpdating,
            required: true,
            value: editedName
          },
          {
            value: ($$value) => {
              editedName = $$value;
              $$settled = false;
            }
          },
          {}
        )} ${validate_component(FormInput, "FormInput").$$render(
          $$result,
          {
            id: "phone",
            label: "Phone Number",
            type: "tel",
            placeholder: "(555) 123-4567",
            disabled: isUpdating,
            value: editedPhone
          },
          {
            value: ($$value) => {
              editedPhone = $$value;
              $$settled = false;
            }
          },
          {}
        )}</div> ${isDirty ? `<div class="form-actions svelte-74a9qi">${validate_component(Button, "Button").$$render($$result, { variant: "primary", disabled: isUpdating }, {}, {
          default: () => {
            return `${`💾 Save Changes`}`;
          }
        })} ${validate_component(Button, "Button").$$render(
          $$result,
          {
            variant: "secondary",
            disabled: isUpdating
          },
          {},
          {
            default: () => {
              return `↶ Reset`;
            }
          }
        )}</div>` : ``}</div>  <div class="info-section svelte-74a9qi"><h3 class="svelte-74a9qi" data-svelte-h="svelte-1wd9hoh">📋 Account Details</h3> <div class="info-grid svelte-74a9qi"><div class="info-item svelte-74a9qi"><span class="info-label svelte-74a9qi" data-svelte-h="svelte-1xckbhw">Email Address</span> <span class="info-value svelte-74a9qi">${escape(profile.email)}</span></div> <div class="info-item svelte-74a9qi"><span class="info-label svelte-74a9qi" data-svelte-h="svelte-1uyws8f">Member ID</span> <span class="info-value svelte-74a9qi">${escape(profile.id.slice(0, 8))}...</span></div> <div class="info-item svelte-74a9qi"><span class="info-label svelte-74a9qi" data-svelte-h="svelte-1a4w3tk">Join Date</span> <span class="info-value svelte-74a9qi">${escape(formatDate(profile.join_date))}</span></div> <div class="info-item svelte-74a9qi"><span class="info-label svelte-74a9qi" data-svelte-h="svelte-rhbxyb">Last Login</span> <span class="info-value svelte-74a9qi">${escape(formatDateTime(profile.last_login_at))}</span></div> <div class="info-item svelte-74a9qi"><span class="info-label svelte-74a9qi" data-svelte-h="svelte-nykmbp">Account Status</span> <span class="info-value status-active svelte-74a9qi">${escape(profile.active ? "✅ Active" : "❌ Inactive")}</span></div> ${profile.points !== void 0 ? `<div class="info-item points-item svelte-74a9qi"><span class="info-label svelte-74a9qi" data-svelte-h="svelte-18snck7">Total Points</span> <span class="info-value points-value svelte-74a9qi">${escape(profile.points?.toLocaleString() || 0)}</span></div>` : ``}</div></div></div>` : `${validate_component(EmptyState, "EmptyState").$$render(
          $$result,
          {
            icon: "🔒",
            title: "Not Logged In",
            message: "Please log in to view your profile information.",
            actionLabel: "Sign In",
            actionHref: "/login"
          },
          {},
          {}
        )}`}`}`;
      }
    })}`;
  } while (!$$settled);
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-BQcRsGQ3.js.map
