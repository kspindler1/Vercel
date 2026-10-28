(() => {
  const root = document.getElementById("root");
  if (!root) return;

  const addCopilotLink = () => {
    const panel = document.querySelector('section[aria-label="Genie chat"]');
    const actions = panel?.querySelector("header > div:last-child");
    if (!actions || actions.querySelector("[data-copilot-action]")) return;

    const link = document.createElement("a");
    link.href = "https://copilot.microsoft.com/";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "genie-copilot-link";
    link.textContent = "Copilot";
    link.title = "Open Microsoft Copilot in a new tab";
    link.setAttribute("aria-label", "Open Microsoft Copilot in a new tab");
    link.dataset.copilotAction = "true";

    actions.insertBefore(link, actions.querySelector("button"));
  };

  new MutationObserver(addCopilotLink).observe(root, { childList: true, subtree: true });
  addCopilotLink();
})();