const STAGGER_MS = 75;

export function mountReveal(selector = "[data-reveal]") {
  const root = document.documentElement;
  const items = [...document.querySelectorAll<HTMLElement>(selector)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window) || items.length === 0) {
    return;
  }

  for (const item of items) {
    item.setAttribute("data-reveal", "");
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      item.classList.add("is-in");
    }
  }
  root.classList.add("reveal-ready");

  const observer = new IntersectionObserver(
    (entries) => {
      let batch = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        const item = entry.target as HTMLElement;
        item.style.setProperty(
          "--reveal-delay",
          `${Math.min(batch, 6) * STAGGER_MS}ms`
        );
        item.classList.add("is-in");
        observer.unobserve(item);
        batch += 1;
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  );

  for (const item of items) {
    if (!item.classList.contains("is-in")) {
      observer.observe(item);
    }
  }

  const revealRest = () => {
    const atBottom =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 4;
    if (!atBottom) {
      return;
    }
    for (const item of items) {
      item.classList.add("is-in");
      observer.unobserve(item);
    }
    window.removeEventListener("scroll", revealRest);
  };
  window.addEventListener("scroll", revealRest, { passive: true });
}
