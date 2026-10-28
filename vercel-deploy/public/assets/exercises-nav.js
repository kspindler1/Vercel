(() => {
  const root = document.getElementById("root");
  if (!root) return;

  const exerciseTabs = [...document.querySelectorAll("[data-exercise-target]")];
  const exercisePanels = [...document.querySelectorAll(".exercise-panel")];
  exerciseTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.exerciseTarget;
      exerciseTabs.forEach((item) => {
        const selected = item === tab;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      exercisePanels.forEach((panel) => {
        panel.hidden = panel.id !== target;
      });
    });
  });

  const enableHeaderNavigation = () => {
    document.querySelectorAll("header a[href]").forEach((link) => {
      if (link.dataset.exercisesNavigation === "true") return;
      link.dataset.exercisesNavigation = "true";
      link.addEventListener("click", (event) => {
        if (!document.body.classList.contains("exercises-route")) return;
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (new URL(link.href).origin !== window.location.origin) return;
        document.body.classList.remove("exercises-route");
        document.title = "Kloud · Agent Builder Portal";
      }, true);
    });
  };

  const addExercisesTab = () => {
    const isExercisesPage = document.body.classList.contains("exercises-route") || window.location.pathname === "/exercises.html";
    document.body.classList.toggle("exercises-route", isExercisesPage);
    document.title = isExercisesPage ? "Exercises · Kloud" : "Kloud · Agent Builder Portal";
    if (isExercisesPage && window.location.pathname !== "/exercises.html") {
      window.history.replaceState(window.history.state, "", "/exercises.html");
    }
    document.querySelectorAll("header nav").forEach((nav) => {
      const startLink = [...nav.querySelectorAll("a")].find((link) => link.textContent.trim() === "Start here");
      if (!startLink) return;
      let exercisesLink = nav.querySelector('[data-exercises-tab="true"]') || nav.querySelector('a[href="/exercises.html"]');
      if (!exercisesLink) {
        exercisesLink = startLink.cloneNode(false);
        exercisesLink.href = "/exercises.html";
        exercisesLink.textContent = "Exercises";
        exercisesLink.dataset.exercisesTab = "true";
        startLink.after(exercisesLink);
      }
      exercisesLink.dataset.exercisesTab = "true";
      exercisesLink.classList.toggle("bg-genie-50", isExercisesPage);
      exercisesLink.classList.toggle("text-genie-700", isExercisesPage);
      if (isExercisesPage) exercisesLink.setAttribute("aria-current", "page");
      else exercisesLink.removeAttribute("aria-current");

      if (isExercisesPage) {
        const homeLink = [...nav.querySelectorAll("a")].find((link) => link.textContent.trim() === "Home");
        homeLink?.classList.remove("bg-genie-50", "text-genie-700");
        homeLink?.removeAttribute("aria-current");
      }
    });
    enableHeaderNavigation();
  };

  new MutationObserver(addExercisesTab).observe(root, { childList: true, subtree: true });
  window.addEventListener("popstate", addExercisesTab);
  addExercisesTab();
})();