"use strict";
var UnlayerLivewireBundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // resources/js/index.ts
  var index_exports = {};
  __export(index_exports, {
    createUnlayerLivewireBridge: () => createUnlayerLivewireBridge,
    default: () => index_default2,
    registerUnlayerLivewire: () => registerUnlayerLivewire,
    uploadThroughLivewire: () => uploadThroughLivewire
  });

  // node_modules/@community-sdks/unlayer-ts/dist/index.js
  var defaultScriptUrl = "https://editor.unlayer.com/embed.js?2";
  var scriptPromise = null;
  var UnlayerStockTemplateClient = class {
    constructor(searchUrl = "https://unlayer.com/templates/search", loadUrl = "https://studio.unlayer.com/api/v1/graphql") {
      this.searchUrl = searchUrl;
      this.loadUrl = loadUrl;
    }
    async search(options = {}) {
      const limit = options.limit ?? 20;
      const offset = options.offset ?? 0;
      const page = Math.floor(offset / limit) + 1;
      const response = await fetch(this.searchUrl, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          page,
          perPage: limit,
          filter: {
            premium: options.premium ? "true" : "",
            collection: options.collection ?? "",
            name: options.search ?? "",
            sortBy: options.sort ?? "recent",
            type: options.type ?? "email"
          }
        })
      });
      if (!response.ok) {
        throw new Error("Unable to search Unlayer templates.");
      }
      const body = await response.json();
      return (body.data ?? []).map((template) => {
        const slug = typeof template.slug === "string" ? template.slug : null;
        if (!slug) {
          return null;
        }
        return {
          ...template,
          slug,
          name: typeof template.name === "string" ? template.name : "Untitled template",
          rating: typeof template.rating === "number" || typeof template.rating === "string" ? template.rating : null,
          premium: Boolean(template.premium),
          thumbnail: `https://api.unlayer.com/v2/stock-templates/${slug}/thumbnail?width=500`
        };
      }).filter((template) => template !== null);
    }
    async load(slug) {
      const response = await fetch(this.loadUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: `
                    query StockTemplateLoad($slug: String!) {
                        StockTemplate(slug: $slug) {
                            StockTemplatePages {
                                design
                            }
                        }
                    }
                `,
          variables: {
            slug
          }
        })
      });
      if (!response.ok) {
        throw new Error(`Unable to load Unlayer template [${slug}].`);
      }
      const body = await response.json();
      const design = body.data?.StockTemplate?.StockTemplatePages?.[0]?.design;
      if (!design) {
        throw new Error(`Unlayer template [${slug}] did not return a design.`);
      }
      return {
        slug,
        design
      };
    }
  };
  var HttpTemplateClient = class {
    constructor(searchUrlOrOptions, loadUrl) {
      this.searchUrl = typeof searchUrlOrOptions === "string" ? searchUrlOrOptions : searchUrlOrOptions.searchUrl;
      this.loadUrl = typeof searchUrlOrOptions === "string" ? loadUrl ?? searchUrlOrOptions : searchUrlOrOptions.loadUrl;
    }
    async search(options = {}) {
      const url = new URL(this.searchUrl, window.location.origin);
      Object.entries(options).forEach(([key, value]) => {
        if (value !== void 0 && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });
      const response = await fetch(url, {
        headers: {
          Accept: "application/json"
        }
      });
      if (!response.ok) {
        throw new Error("Unable to search templates.");
      }
      const body = await response.json();
      return body.data ?? [];
    }
    async load(slug) {
      const response = await fetch(this.resolveLoadUrl(slug), {
        headers: {
          Accept: "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`Unable to load template [${slug}].`);
      }
      const body = await response.json();
      if (!body.data?.design) {
        throw new Error(`Template [${slug}] did not return a design.`);
      }
      return body.data;
    }
    resolveLoadUrl(slug) {
      if (this.loadUrl.includes(":slug")) {
        return this.loadUrl.replace(":slug", encodeURIComponent(slug));
      }
      return `${this.loadUrl.replace(/\/$/, "")}/${encodeURIComponent(slug)}`;
    }
  };
  var UnlayerEditor = class {
    constructor(options) {
      this.options = options;
      this.ready = false;
      this.internalUpdate = false;
      this.booting = true;
      this.scriptUrl = options.scriptUrl ?? defaultScriptUrl;
      this.displayMode = options.displayMode ?? "email";
      this.unlayerOptions = options.unlayerOptions ?? {};
      this.templateClient = options.templateClient ?? new UnlayerStockTemplateClient();
      this.templateSearch = options.templateSearch ?? {};
      this.templatePicker = {
        enabled: options.templatePicker?.enabled ?? Boolean(options.templateSearch),
        showTrigger: options.templatePicker?.showTrigger ?? true,
        label: options.templatePicker?.label ?? "Template Editor",
        triggerLabel: options.templatePicker?.triggerLabel ?? "Templates",
        title: options.templatePicker?.title ?? "Templates",
        placeholder: options.templatePicker?.placeholder ?? "Search templates",
        emptyText: options.templatePicker?.emptyText ?? "No templates found."
      };
      this.state = normalizeState(options.state);
    }
    async mount() {
      await loadUnlayerScript(this.scriptUrl);
      const unlayer = this.getUnlayer();
      unlayer.init({
        id: this.options.id,
        displayMode: this.displayMode,
        ...this.unlayerOptions
      });
      this.registerImageUploadCallback();
      this.registerDesignUpdatedListener();
      this.mountTemplatePicker();
      this.ready = true;
      this.loadDesign(this.state.design, { exportAfterLoad: false });
      this.options.onReady?.(this);
    }
    isReady() {
      return this.ready;
    }
    getState() {
      return clone(this.state);
    }
    setState(state) {
      const nextState = normalizeState(state);
      this.state = nextState;
      if (this.ready && !this.internalUpdate) {
        this.loadDesign(nextState.design);
      }
      this.internalUpdate = false;
    }
    loadDesign(design, options = {}) {
      if (!this.ready || isEmptyDesign(design)) {
        return;
      }
      this.getUnlayer().loadDesign(clone(design));
      if (options.exportAfterLoad ?? true) {
        this.exportState();
      }
    }
    async exportState() {
      const data = await new Promise((resolve) => {
        this.getUnlayer().exportHtml(resolve);
      });
      this.internalUpdate = true;
      this.state = {
        html: data.html ?? "",
        design: clone(data.design ?? {})
      };
      this.booting = false;
      this.options.onChange?.(this.getState());
      return this.getState();
    }
    async searchTemplates(options = {}) {
      return this.templateClient.search({
        type: this.displayMode,
        ...this.templateSearch,
        ...options
      });
    }
    async loadTemplate(slug) {
      const template = await this.templateClient.load(slug);
      this.loadDesign(template.design);
      return this.getState();
    }
    async openTemplatePicker() {
      if (!this.templatePickerElements) {
        return;
      }
      this.templatePickerElements.panel.hidden = false;
      await this.refreshTemplatePicker();
      this.templatePickerElements.searchInput.focus();
    }
    closeTemplatePicker() {
      if (this.templatePickerElements) {
        this.templatePickerElements.panel.hidden = true;
      }
    }
    registerImageUploadCallback() {
      if (!this.options.uploadImage) {
        return;
      }
      this.getUnlayer().registerCallback("image", (file, done) => {
        const attachment = file.attachments[0];
        this.options.uploadImage?.(attachment).then((url) => done({ progress: 100, url })).catch((error) => this.handleError(error));
      });
    }
    registerDesignUpdatedListener() {
      this.getUnlayer().addEventListener("design:updated", () => {
        if (!this.booting) {
          this.internalUpdate = true;
        }
        this.exportState().catch((error) => this.handleError(error));
      });
    }
    mountTemplatePicker() {
      if (!this.templatePicker.enabled) {
        return;
      }
      const container = document.getElementById(this.options.id);
      if (!container) {
        return;
      }
      container.style.position = container.style.position || "relative";
      container.classList.add("unlayer-sdk-editor-surface");
      container.appendChild(this.createTemplatePickerPanel());
      const elements = this.templatePickerElements;
      if (!elements) {
        return;
      }
      elements.surface = container;
      if (this.templatePicker.showTrigger) {
        const toolbar = this.createTemplatePickerToolbar();
        elements.toolbar = toolbar;
        container.parentElement?.insertBefore(toolbar, container);
      }
    }
    createTemplatePickerToolbar() {
      const toolbar = document.createElement("div");
      toolbar.className = "unlayer-sdk-template-toolbar";
      const label = document.createElement("span");
      label.className = "unlayer-sdk-template-toolbar-label";
      label.textContent = this.templatePicker.label;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "unlayer-sdk-template-toolbar-button";
      button.textContent = this.templatePicker.triggerLabel;
      button.addEventListener("click", () => {
        this.openTemplatePicker().catch((error) => this.handleError(error));
      });
      toolbar.append(label, button);
      return toolbar;
    }
    createTemplatePickerPanel() {
      const panel = document.createElement("section");
      panel.className = "unlayer-sdk-template-panel";
      panel.hidden = true;
      const header = document.createElement("div");
      header.className = "unlayer-sdk-template-panel-header";
      const title = document.createElement("strong");
      title.textContent = this.templatePicker.title;
      const close = document.createElement("button");
      close.type = "button";
      close.className = "unlayer-sdk-template-close";
      close.setAttribute("aria-label", "Close templates");
      close.textContent = "\xD7";
      close.addEventListener("click", () => this.closeTemplatePicker());
      const searchInput = document.createElement("input");
      searchInput.type = "search";
      searchInput.className = "unlayer-sdk-template-search";
      searchInput.placeholder = this.templatePicker.placeholder;
      searchInput.value = this.templateSearch.search ?? "";
      searchInput.addEventListener("input", debounce(() => {
        this.refreshTemplatePicker(searchInput.value).catch((error) => this.handleError(error));
      }, 300));
      const status = document.createElement("div");
      status.className = "unlayer-sdk-template-status";
      const grid = document.createElement("div");
      grid.className = "unlayer-sdk-template-grid";
      header.append(title, close);
      panel.append(stylesElement(), header, searchInput, status, grid);
      this.templatePickerElements = {
        panel,
        searchInput,
        grid,
        status,
        surface: panel
      };
      return panel;
    }
    async refreshTemplatePicker(search) {
      if (!this.templatePickerElements) {
        return;
      }
      const { grid, status } = this.templatePickerElements;
      status.textContent = "Loading templates...";
      grid.replaceChildren();
      const templates = await this.searchTemplates({
        search: search ?? this.templateSearch.search ?? ""
      });
      status.textContent = templates.length === 0 ? this.templatePicker.emptyText : "";
      grid.replaceChildren(
        ...templates.map((template) => this.createTemplateCard(template))
      );
    }
    createTemplateCard(template) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "unlayer-sdk-template-card";
      if (template.thumbnail) {
        const image = document.createElement("img");
        image.src = template.thumbnail;
        image.alt = "";
        image.loading = "lazy";
        card.appendChild(image);
      }
      const name = document.createElement("span");
      name.textContent = template.name;
      card.appendChild(name);
      const loader = document.createElement("span");
      loader.className = "unlayer-sdk-template-card-loader";
      loader.setAttribute("aria-hidden", "true");
      loader.hidden = true;
      card.appendChild(loader);
      card.addEventListener("click", async () => {
        if (card.disabled) {
          return;
        }
        card.disabled = true;
        card.classList.add("unlayer-sdk-template-card-loading");
        loader.hidden = false;
        if (this.templatePickerElements) {
          this.templatePickerElements.status.textContent = "Loading template...";
        }
        try {
          await this.loadTemplate(template.slug);
          this.closeTemplatePicker();
        } catch (error) {
          card.disabled = false;
          card.classList.remove("unlayer-sdk-template-card-loading");
          loader.hidden = true;
          this.handleError(error);
        }
      });
      return card;
    }
    getUnlayer() {
      if (!window.unlayer) {
        throw new Error("Unlayer script is not loaded.");
      }
      return window.unlayer;
    }
    handleError(error) {
      if (this.options.onError) {
        this.options.onError(error);
        return;
      }
      throw error;
    }
  };
  async function loadUnlayerScript(scriptUrl = defaultScriptUrl) {
    if (window.unlayer) {
      return;
    }
    if (scriptPromise) {
      return scriptPromise;
    }
    scriptPromise = new Promise((resolve, reject) => {
      const existingScript = Array.from(document.querySelectorAll("script")).find((script2) => script2.src.includes(scriptUrl));
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.appendChild(script);
    });
    return scriptPromise;
  }
  function normalizeState(state) {
    if (!state) {
      return {
        html: "",
        design: {}
      };
    }
    if ("design" in state || "html" in state) {
      return {
        html: typeof state.html === "string" ? state.html : "",
        design: clone(state.design ?? {})
      };
    }
    return {
      html: "",
      design: clone(state)
    };
  }
  function isEmptyDesign(design) {
    return Object.keys(design).length === 0;
  }
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function debounce(callback, wait) {
    let timeout;
    return () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(callback, wait);
    };
  }
  function stylesElement() {
    const style = document.createElement("style");
    style.textContent = `
        .unlayer-sdk-template-toolbar {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
            gap: 12px;
            min-height: 48px;
            box-sizing: border-box;
            border: 1px solid #d1d5db;
            border-bottom: 0;
            background: #ffffff;
            padding: 8px 12px;
            color: #111827;
            font: 14px/1.4 Arial, sans-serif;
        }

        .unlayer-sdk-editor-surface {
            border: 1px solid #d1d5db;
            box-sizing: border-box;
        }

        .unlayer-sdk-template-toolbar-label {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: 600;
        }

        .unlayer-sdk-template-toolbar-button {
            grid-column: 3;
            justify-self: end;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 34px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: #f9fafb;
            color: #111827;
            font: 600 13px/1.2 Arial, sans-serif;
            padding: 0 12px;
            cursor: pointer;
            box-sizing: border-box;
        }

        .unlayer-sdk-template-toolbar-button:hover {
            background: #ffffff;
            border-color: #9ca3af;
        }

        .unlayer-sdk-template-panel {
            position: absolute;
            inset: 0;
            z-index: 40;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: #ffffff;
            color: #111827;
            border: 1px solid #d1d5db;
            font: 14px/1.4 Arial, sans-serif;
        }

        .unlayer-sdk-template-panel[hidden] {
            display: none;
        }

        .unlayer-sdk-template-panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-height: 56px;
            padding: 0 18px;
            border-bottom: 1px solid #e5e7eb;
        }

        .unlayer-sdk-template-close {
            width: 34px;
            height: 34px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: #ffffff;
            color: #111827;
            cursor: pointer;
        }

        .unlayer-sdk-template-search {
            display: block;
            width: calc(100% - 36px);
            margin: 16px 18px 8px;
            min-height: 40px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 0 12px;
            background: #ffffff;
            color: #111827;
            font: inherit;
            box-sizing: border-box;
            appearance: none;
            -webkit-appearance: none;
        }

        .unlayer-sdk-template-search::-webkit-search-decoration,
        .unlayer-sdk-template-search::-webkit-search-cancel-button,
        .unlayer-sdk-template-search::-webkit-search-results-button,
        .unlayer-sdk-template-search::-webkit-search-results-decoration {
            -webkit-appearance: none;
            appearance: none;
        }

        .unlayer-sdk-template-status {
            min-height: 22px;
            padding: 0 18px 8px;
            color: #6b7280;
            font-size: 13px;
        }

        .unlayer-sdk-template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
            overflow: auto;
            padding: 0 18px 18px;
        }

        .unlayer-sdk-template-card {
            display: flex;
            flex-direction: column;
            gap: 10px;
            position: relative;
            min-height: 238px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: #ffffff;
            padding: 10px;
            text-align: left;
            cursor: pointer;
        }

        .unlayer-sdk-template-card:hover {
            border-color: #2563eb;
        }

        .unlayer-sdk-template-card:disabled {
            cursor: wait;
            opacity: 0.86;
        }

        .unlayer-sdk-template-card img {
            width: 100%;
            aspect-ratio: 16 / 11;
            object-fit: cover;
            background: #f3f4f6;
            border-radius: 4px;
        }

        .unlayer-sdk-template-card span {
            color: #111827;
            font-weight: 600;
            line-height: 1.35;
            overflow-wrap: anywhere;
        }

        .unlayer-sdk-template-card-loader {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 20px;
            height: 20px;
            box-sizing: border-box;
            border: 2px solid #d1d5db;
            border-top-color: #2563eb;
            border-radius: 999px;
            background: transparent;
            animation: unlayer-sdk-template-spin 0.8s linear infinite;
        }

        .unlayer-sdk-template-card-loader[hidden] {
            display: none;
        }

        @keyframes unlayer-sdk-template-spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;
    return style;
  }
  var index_default = UnlayerEditor;

  // node_modules/@community-sdks/unlayer-alpinejs/dist/index.js
  function createUnlayerAlpineComponent(options) {
    const autoMount = options.autoMount ?? true;
    const usesBuiltInTemplatePicker = options.templatePicker?.enabled ?? Boolean(options.templateSearch);
    return {
      editor: null,
      state: normalizeState2(options.state),
      ready: false,
      mounted: false,
      loading: false,
      error: null,
      templates: [],
      templatesOpen: false,
      templatesLoading: false,
      templateSearch: options.templateSearch?.search ?? "",
      templateSearchOptions: options.templateSearch ?? {},
      uploadImage: options.uploadImage,
      init() {
        if (autoMount) {
          queueMicrotask(() => {
            this.mount().catch((error) => {
              this.error = error;
            });
          });
        }
      },
      async mount() {
        if (this.editor) {
          return this.editor;
        }
        this.loading = true;
        const editor = new index_default({
          ...options,
          state: this.state,
          onReady: (readyEditor) => {
            this.ready = true;
            options.onReady?.(readyEditor, this);
          },
          onChange: (state) => {
            this.state = state;
            options.onChange?.(state, this);
          },
          onError: (error) => {
            this.error = error;
            options.onError?.(error, this);
          }
        });
        this.editor = editor;
        try {
          await editor.mount();
          this.mounted = true;
          return editor;
        } finally {
          this.loading = false;
        }
      },
      isReady() {
        return Boolean(this.editor?.isReady());
      },
      getState() {
        return this.editor?.getState() ?? this.state;
      },
      setState(state) {
        this.state = normalizeState2(state);
        this.editor?.setState(this.state);
      },
      loadDesign(design, loadOptions = {}) {
        this.editor?.loadDesign(design, loadOptions);
      },
      async exportState() {
        if (!this.editor) {
          return this.state;
        }
        this.state = await this.editor.exportState();
        return this.state;
      },
      async searchTemplates(searchOptions = {}) {
        const editor = await this.mount();
        if (searchOptions.search !== void 0) {
          this.templateSearch = searchOptions.search;
          this.templateSearchOptions.search = searchOptions.search;
        }
        this.templatesLoading = true;
        try {
          const templates = await editor.searchTemplates({
            ...this.templateSearchOptions,
            ...searchOptions,
            search: searchOptions.search ?? this.templateSearch
          });
          this.templates = templates;
          return templates;
        } finally {
          this.templatesLoading = false;
        }
      },
      async refreshTemplates() {
        return this.searchTemplates();
      },
      async loadTemplate(slug) {
        const editor = await this.mount();
        this.loading = true;
        try {
          this.state = await editor.loadTemplate(slug);
          this.templatesOpen = false;
          return this.state;
        } finally {
          this.loading = false;
        }
      },
      async chooseTemplate(template) {
        return this.loadTemplate(typeof template === "string" ? template : template.slug);
      },
      async openTemplates() {
        const editor = await this.mount();
        this.templatesOpen = true;
        if (usesBuiltInTemplatePicker) {
          await editor.openTemplatePicker();
          return;
        }
        if (this.templates.length === 0) {
          await this.refreshTemplates();
        }
      },
      closeTemplates() {
        this.templatesOpen = false;
        this.editor?.closeTemplatePicker();
      },
      async setTemplateSearch(search) {
        this.templateSearch = search;
        this.templateSearchOptions.search = search;
        return this.searchTemplates({ search });
      }
    };
  }
  function registerUnlayerAlpine(Alpine, name = "unlayerEditor") {
    Alpine.data(name, createUnlayerAlpineComponent);
  }
  function normalizeState2(state) {
    if (!state) {
      return {
        html: "",
        design: {}
      };
    }
    if ("design" in state || "html" in state) {
      return {
        html: typeof state.html === "string" ? state.html : "",
        design: clone2(state.design ?? {})
      };
    }
    return {
      html: "",
      design: clone2(state)
    };
  }
  function clone2(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // resources/js/index.ts
  var registeredAlpine = false;
  function createUnlayerLivewireBridge() {
    return {
      upload(wire, property = "imageUpload") {
        return function uploadImage(file) {
          return uploadThroughLivewire(wire, property, file);
        };
      },
      templates(searchUrl = "/unlayer-livewire/templates", loadUrl = "/unlayer-livewire/templates") {
        return new HttpTemplateClient(searchUrl, loadUrl);
      },
      sync(wire, property = "state", live = false) {
        return function syncState(state) {
          return wire.$set(property, state, live);
        };
      },
      exportTo(wire, method = "exported") {
        return function exportState(state) {
          return wire.$call(method, state);
        };
      }
    };
  }
  function uploadThroughLivewire(wire, property, file) {
    const upload = wire.$upload ?? wire.upload;
    if (!upload) {
      return Promise.reject(new Error("Livewire upload API is not available."));
    }
    return new Promise((resolve, reject) => {
      upload.call(
        wire,
        property,
        file,
        (uploadedFilename) => {
          wire.$call("resolveUploadedImage", uploadedFilename).then((url) => resolve(String(url))).catch(reject);
        },
        reject
      );
    });
  }
  function registerUnlayerLivewire(Alpine, alpineComponentName = "unlayerEditor") {
    if (registeredAlpine) {
      return;
    }
    registerUnlayerAlpine(Alpine, alpineComponentName);
    registeredAlpine = true;
    window.UnlayerLivewire = createUnlayerLivewireBridge();
  }
  document.addEventListener("alpine:init", () => {
    if (window.Alpine) {
      registerUnlayerLivewire(window.Alpine);
    }
  });
  if (window.Alpine) {
    registerUnlayerLivewire(window.Alpine);
  }
  if (!window.UnlayerLivewire) {
    window.UnlayerLivewire = createUnlayerLivewireBridge();
  }
  var index_default2 = registerUnlayerLivewire;
  return __toCommonJS(index_exports);
})();
