(() => {
  const controls = document.querySelector(".publication-filters");
  const select = document.querySelector("#topic-filter");
  if (!controls || !select) return;
  const entries = [...document.querySelectorAll(".publication")];
  const count = document.querySelector("#publication-count");
  const empty = document.querySelector("#no-publications");
  const allTopics = new Set([...select.options].map((option) => option.value));
  function update(fromURL = false) {
    const topic = fromURL
      ? new URL(location.href).searchParams.get("topic") || ""
      : select.value;
    // Unknown categories deliberately show no results instead of silently showing everything.
    if (!allTopics.has(topic) && topic) {
      const option = new Option(topic, topic);
      select.add(option);
      allTopics.add(topic);
    }
    select.value = topic;
    let visible = 0;
    for (const entry of entries) {
      const matches =
        !topic || JSON.parse(entry.dataset.topics).includes(topic);
      entry.hidden = !matches;
      if (matches) visible++;
    }
    count.textContent = visible + (visible === 1 ? " entry" : " entries");
    empty.hidden = visible > 0;
    if (!fromURL) {
      const url = new URL(location.href);
      if (topic) url.searchParams.set("topic", topic);
      else url.searchParams.delete("topic");
      try {
        history.replaceState(null, "", url);
      } catch {
        /* file:// previews may restrict history updates. */
      }
    }
  }
  controls.hidden = false;
  select.addEventListener("change", () => update());
  addEventListener("popstate", () => update(true));
  update(true);
})();
