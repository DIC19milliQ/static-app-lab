export const initOfflineLab = ({ registration }) => {
  const swStatus = document.getElementById("offline-sw-status");
  const cacheVersion = document.getElementById("offline-cache-version");
  const lastUpdated = document.getElementById("offline-last-updated");
  const displayMode = document.getElementById("offline-display-mode");
  const updateStatus = document.getElementById("offline-update-status");
  const checkUpdate = document.getElementById("offline-check-update");
  const reloadUpdate = document.getElementById("offline-reload");

  const updateLastUpdated = () => {
    const timestamp = new Date().toLocaleString();
    localStorage.setItem("static-app-lab:lastUpdated", timestamp);
    lastUpdated.textContent = `Last loaded: ${timestamp}`;
  };

  const updateStatusText = () => {
    const registered = Boolean(navigator.serviceWorker?.controller);
    swStatus.textContent = `Service Worker: ${registered ? "Registered" : "Not registered"}`;
    displayMode.textContent = `Display mode: ${{
      true: "standalone",
      false: "browser",
    }[window.matchMedia("(display-mode: standalone)").matches]}`;
    updateStatus.textContent = registration?.waiting
      ? "Update ready: Reload to activate the new version."
      : "No update waiting.";
    reloadUpdate.classList.toggle("hidden", !registration?.waiting);
  };

  const updateCacheVersion = async () => {
    if (!("caches" in window)) {
      cacheVersion.textContent = "Cache: Not supported in this browser.";
      return;
    }
    const keys = await caches.keys();
    const match = keys.find((key) => key.includes("static-app-lab")) || keys[0];
    cacheVersion.textContent = match ? `Cache: ${match}` : "Cache: No cache found.";
  };

  checkUpdate.addEventListener("click", async () => {
    if (!registration) {
      updateStatus.textContent = "Service Worker is not registered yet.";
      return;
    }
    updateStatus.textContent = "Checking for updates...";
    await registration.update();
    updateStatusText();
  });

  reloadUpdate.addEventListener("click", () => {
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
  });

  if (registration) {
    registration.addEventListener("updatefound", () => {
      updateStatus.textContent = "Update found. Waiting for install...";
      const newWorker = registration.installing;
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed") {
          updateStatusText();
        }
      });
    });
  }

  updateLastUpdated();
  updateStatusText();
  updateCacheVersion();
};
