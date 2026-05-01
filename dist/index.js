// resources/js/index.ts
import {
  registerUnlayerAlpine
} from "@community-sdks/unlayer-alpinejs";
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
  registerUnlayerAlpine(Alpine, alpineComponentName);
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
export {
  createUnlayerLivewireBridge,
  index_default as default,
  registerUnlayerLivewire,
  uploadThroughLivewire
};
//# sourceMappingURL=index.js.map