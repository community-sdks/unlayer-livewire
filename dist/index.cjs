"use strict";
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
  default: () => index_default,
  registerUnlayerLivewire: () => registerUnlayerLivewire,
  uploadThroughLivewire: () => uploadThroughLivewire
});
module.exports = __toCommonJS(index_exports);
var import_unlayer_alpinejs = require("@community-sdks/unlayer-alpinejs");
function createUnlayerLivewireBridge() {
  return {
    upload(wire, property = "imageUpload") {
      return function uploadImage(file) {
        return uploadThroughLivewire(wire, property, file);
      };
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
  return new Promise((resolve, reject) => {
    wire.$upload(
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
  (0, import_unlayer_alpinejs.registerUnlayerAlpine)(Alpine, alpineComponentName);
  window.UnlayerLivewire = createUnlayerLivewireBridge();
}
document.addEventListener("alpine:init", () => {
  if (window.Alpine) {
    registerUnlayerLivewire(window.Alpine);
  }
});
if (!window.UnlayerLivewire) {
  window.UnlayerLivewire = createUnlayerLivewireBridge();
}
var index_default = registerUnlayerLivewire;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createUnlayerLivewireBridge,
  registerUnlayerLivewire,
  uploadThroughLivewire
});
//# sourceMappingURL=index.cjs.map