import { c as create_ssr_component, d as escape } from './ssr-CFMHIens.js';

/* empty css                                    */
const css = {
  code: ".container.svelte-1n90l0u{width:100%;padding:0 var(--space-4)}.container-center.svelte-1n90l0u{margin-left:auto;margin-right:auto}.container-no-padding.svelte-1n90l0u{padding:0}.container-xs.svelte-1n90l0u{max-width:var(--container-xs)}.container-sm.svelte-1n90l0u{max-width:var(--container-sm)}.container-md.svelte-1n90l0u{max-width:var(--container-md)}.container-lg.svelte-1n90l0u{max-width:var(--container-lg)}.container-xl.svelte-1n90l0u{max-width:var(--container-xl)}.container-2xl.svelte-1n90l0u{max-width:var(--container-2xl)}.container-full.svelte-1n90l0u{max-width:100%}@media(max-width: 640px){.container.svelte-1n90l0u:not(.container-no-padding){padding:0 var(--space-4)}}",
  map: `{"version":3,"file":"Container.svelte","sources":["Container.svelte"],"sourcesContent":["<script>\\r\\n  /**\\r\\n   * Container Component\\r\\n   *\\r\\n   * A responsive container with max-width constraints.\\r\\n   *\\r\\n   * @prop {string} size - Container size: 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'\\r\\n   * @prop {boolean} center - Center the container (default: true)\\r\\n   * @prop {boolean} noPadding - Remove horizontal padding\\r\\n   */\\r\\n\\r\\n  export let size = 'lg';\\r\\n  export let center = true;\\r\\n  export let noPadding = false;\\r\\n<\/script>\\r\\n\\r\\n<div\\r\\n  class=\\"container container-{size}\\"\\r\\n  class:container-center={center}\\r\\n  class:container-no-padding={noPadding}\\r\\n>\\r\\n  <slot />\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  .container {\\r\\n    width: 100%;\\r\\n    padding: 0 var(--space-4);\\r\\n  }\\r\\n\\r\\n  .container-center {\\r\\n    margin-left: auto;\\r\\n    margin-right: auto;\\r\\n  }\\r\\n\\r\\n  .container-no-padding {\\r\\n    padding: 0;\\r\\n  }\\r\\n\\r\\n  .container-xs {\\r\\n    max-width: var(--container-xs);\\r\\n  }\\r\\n\\r\\n  .container-sm {\\r\\n    max-width: var(--container-sm);\\r\\n  }\\r\\n\\r\\n  .container-md {\\r\\n    max-width: var(--container-md);\\r\\n  }\\r\\n\\r\\n  .container-lg {\\r\\n    max-width: var(--container-lg);\\r\\n  }\\r\\n\\r\\n  .container-xl {\\r\\n    max-width: var(--container-xl);\\r\\n  }\\r\\n\\r\\n  .container-2xl {\\r\\n    max-width: var(--container-2xl);\\r\\n  }\\r\\n\\r\\n  .container-full {\\r\\n    max-width: 100%;\\r\\n  }\\r\\n\\r\\n  /* Responsive padding */\\r\\n  @media (max-width: 640px) {\\r\\n    .container:not(.container-no-padding) {\\r\\n      padding: 0 var(--space-4);\\r\\n    }\\r\\n  }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAyBE,yBAAW,CACT,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,CAAC,CAAC,IAAI,SAAS,CAC1B,CAEA,gCAAkB,CAChB,WAAW,CAAE,IAAI,CACjB,YAAY,CAAE,IAChB,CAEA,oCAAsB,CACpB,OAAO,CAAE,CACX,CAEA,4BAAc,CACZ,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,4BAAc,CACZ,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,4BAAc,CACZ,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,4BAAc,CACZ,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,4BAAc,CACZ,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,6BAAe,CACb,SAAS,CAAE,IAAI,eAAe,CAChC,CAEA,8BAAgB,CACd,SAAS,CAAE,IACb,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,yBAAU,KAAK,qBAAqB,CAAE,CACpC,OAAO,CAAE,CAAC,CAAC,IAAI,SAAS,CAC1B,CACF"}`
};
const Container = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { size = "lg" } = $$props;
  let { center = true } = $$props;
  let { noPadding = false } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
  if ($$props.center === void 0 && $$bindings.center && center !== void 0) $$bindings.center(center);
  if ($$props.noPadding === void 0 && $$bindings.noPadding && noPadding !== void 0) $$bindings.noPadding(noPadding);
  $$result.css.add(css);
  return `<div class="${[
    "container container-" + escape(size, true) + " svelte-1n90l0u",
    (center ? "container-center" : "") + " " + (noPadding ? "container-no-padding" : "")
  ].join(" ").trim()}">${slots.default ? slots.default({}) : ``} </div>`;
});

export { Container as C };
//# sourceMappingURL=Container-C5rGKtUK.js.map
