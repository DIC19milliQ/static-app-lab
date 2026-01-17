export const initTabs = () => {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const group = tab.dataset.tabGroup || "main";
      tabs.forEach((btn) => {
        const btnGroup = btn.dataset.tabGroup || "main";
        if (btnGroup === group) {
          btn.classList.remove("active");
        }
      });
      panels.forEach((panel) => {
        const panelGroup = panel.dataset.tabGroup || "main";
        if (panelGroup === group) {
          panel.classList.remove("active");
        }
      });
      tab.classList.add("active");
      const targetId =
        tab.dataset.tabTarget || (group === "main" ? `tab-${tab.dataset.tab}` : `tab-${group}-${tab.dataset.tab}`);
      const target = document.querySelector(`#${targetId}`);
      if (target) target.classList.add("active");
    });
  });
};

export const toggleHidden = (element, isHidden) => {
  element.classList.toggle("hidden", isHidden);
};

export const confirmAction = (message) => window.confirm(message);
