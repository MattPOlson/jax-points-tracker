<script>
  /**
   * Container Component
   *
   * A responsive container with max-width constraints.
   *
   * @prop {string} size - Container size: 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'
   * @prop {boolean} center - Center the container (default: true)
   * @prop {boolean} noPadding - Remove horizontal padding
   */

  export let size = 'lg';
  export let center = true;
  export let noPadding = false;
</script>

<div
  class="container container-{size}"
  class:container-center={center}
  class:container-no-padding={noPadding}
>
  <slot />
</div>

<style>
  .container {
    width: 100%;
    padding: 0 var(--space-4);
  }

  .container-center {
    margin-left: auto;
    margin-right: auto;
  }

  .container-no-padding {
    padding: 0;
  }

  .container-xs {
    max-width: var(--container-xs);
  }

  .container-sm {
    max-width: var(--container-sm);
  }

  .container-md {
    max-width: var(--container-md);
  }

  .container-lg {
    max-width: var(--container-lg);
  }

  .container-xl {
    max-width: var(--container-xl);
  }

  .container-2xl {
    max-width: var(--container-2xl);
  }

  .container-full {
    max-width: 100%;
  }

  /* Responsive padding */
  @media (max-width: 640px) {
    .container:not(.container-no-padding) {
      padding: 0 var(--space-4);
    }
  }
</style>
