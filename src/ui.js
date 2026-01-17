export const initTabs = () => {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((btn) => btn.classList.remove("active"));
      panels.forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      const target = document.querySelector(`#tab-${tab.dataset.tab}`);
      if (target) target.classList.add("active");
    });
  });
};

export const toggleHidden = (element, isHidden) => {
  element.classList.toggle("hidden", isHidden);
};

export const confirmAction = (message) => window.confirm(message);
