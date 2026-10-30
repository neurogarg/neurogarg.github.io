(() => {
  const layers = [...document.querySelectorAll(".neural-layer")];
  const controls = document.querySelector(".neural-controls");
  const buttons = [...document.querySelectorAll(".neural-scene")];
  const sections = [...document.querySelectorAll("main > section")];
  if (layers.length !== 3) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value) => Math.max(0, Math.min(1, value));
  let scheduled = false;
  function positions() {
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - innerHeight,
    );
    const middle = sections[Math.floor(sections.length / 2)];
    const last = sections[sections.length - 1];
    const start = middle
      ? Math.min(
          maxScroll,
          Math.max(
            1,
            middle.getBoundingClientRect().top + scrollY - innerHeight * 0.3,
          ),
        )
      : maxScroll / 2;
    const end =
      last && last !== middle
        ? Math.min(
            maxScroll,
            Math.max(
              start + 1,
              last.getBoundingClientRect().top + scrollY - innerHeight * 0.45,
            ),
          )
        : maxScroll;
    return [0, start, end];
  }
  function render() {
    scheduled = false;
    const [, start, end] = positions();
    if (controls)
      controls.hidden = document.documentElement.scrollHeight <= innerHeight;
    const phase =
      scrollY <= start
        ? clamp(scrollY / Math.max(1, start))
        : 1 + clamp((scrollY - start) / Math.max(1, end - start));
    const active = Math.round(phase);
    layers.forEach((layer, index) => {
      // Reduced motion changes scenes instantly, without zoom or rotation.
      layer.style.opacity = reducedMotion.matches
        ? String(index === active ? 1 : 0)
        : String(Math.max(0, 1 - Math.abs(phase - index)));
      layer.style.transform = reducedMotion.matches
        ? "none"
        : "scale(" +
          (1 + phase * 0.065) +
          ") rotate(" +
          (phase - 1) * (index === 1 ? -5 : 4) +
          "deg)";
    });
    buttons.forEach((button, index) => {
      if (index === active) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
  }
  function queueRender() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(render);
  }
  buttons.forEach((button, index) =>
    button.addEventListener("click", () => {
      scrollTo({
        top: positions()[index],
        behavior: reducedMotion.matches ? "instant" : "smooth",
      });
    }),
  );
  if (controls)
    controls.hidden = document.documentElement.scrollHeight <= innerHeight;
  addEventListener("scroll", queueRender, { passive: true });
  addEventListener("resize", queueRender);
  addEventListener("load", queueRender);
  reducedMotion.addEventListener("change", queueRender);
  render();
})();
