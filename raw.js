javascript:(() => {
  try {
    const U = new URL(location.href);
    const H = decodeURIComponent(U.href);

    // Extract Activity ID
    const m = H.match(/(?:activity-|urn:li:activity:)(\d{10,20})\b/);
    if (!m) {
      alert("No LinkedIn Activity ID found in this URL. Open a post URL.");
      return;
    }
    const id = m[1];
    if (typeof BigInt === "undefined") {
      alert("Your browser does not support BigInt.");
      return;
    }

    // Decode Snowflake
    const b = BigInt(id);
    const tsMs = Number(b >> 22n);
    const dc = Number((b >> 17n) & 31n),
      wk = Number((b >> 12n) & 31n),
      seq = Number(b & 4095n);

    // Date formatting
    const d = new Date(tsMs);
    const tz =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
    const pad = (n) => String(n).padStart(2, "0");
    const localStr = `${pad(d.getDate())}.${pad(
      d.getMonth() + 1
    )}.${d.getFullYear()} ${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}:${pad(d.getSeconds())}`;
    const iso = d.toISOString();

    // Relative time
    const rel = ((now) => {
      const ms = now - tsMs,
        abs = Math.abs(ms);
      const s = Math.round(abs / 1e3),
        m = Math.round(s / 60),
        h = Math.round(m / 60),
        dy = Math.round(h / 24),
        w = Math.round(dy / 7),
        mo = Math.round(dy / 30.437),
        y = Math.round(dy / 365.25);
      const f = (n, u) => `${n} ${u}${n === 1 ? "" : "s"}`;
      let t =
        s < 60
          ? f(s, "second")
          : m < 60
          ? f(m, "minute")
          : h < 24
          ? f(h, "hour")
          : dy < 14
          ? f(dy, "day")
          : w < 8
          ? f(w, "week")
          : mo < 18
          ? f(mo, "month")
          : f(y, "year");
      return ms >= 0 ? ` ${t} ago` : ` in ${t}`;
    })(Date.now());

    // URL parts
    const suffix =
      (H.match(/activity-\d{10,20}-([A-Za-z0-9]+)/) || [])[1] || "";
    const publisher =
      (H.match(
        /\/posts\/([^\/?]+?)-activity-\d{10,20}/
      ) || [])[1] ||
      (H.match(/\/posts\/([^\/?]+)\b/) || [])[1] ||
      "";
    const qParams = Object.fromEntries(U.searchParams.entries());

    // Working permalink
    const permalinkUrn = `https://www.linkedin.com/feed/update/urn:li:activity:${id}/`;

    // Output
    const lines = [
      `Activity ID: ${id}`,
      `Created (local ${tz}): ${localStr} (${rel})`,
      `Created (UTC ISO): ${iso}`,
      `Permalink (URN): ${permalinkUrn}`,
      "—",
      `Publisher Slug: ${publisher || "—"}`,
      `Suffix: ${suffix || "—"}`,
      `Snowflake: dc=${dc}, worker=${wk}, seq=${seq}`,
      "—",
      `Query Parameters: ${
        Object.keys(qParams).length
          ? Object.entries(qParams)
              .map(([k, v]) => `${k}=${v}`)
              .join("&")
          : "—"
      }`
    ];
    const out = lines.join("\n");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(out)
        .then(() =>
          alert(out + `\n\n(Copied to clipboard)`)
        )
        .catch(() => alert(out));
    } else {
      alert(out);
    }

    // Console output
    console.log("[LinkedIn URL Info]", {
      id,
      timestamp_ms: tsMs,
      datetime_local: localStr,
      datetime_iso: iso,
      timezone: tz,
      relative: rel,
      publisher,
      suffix,
      snowflake: { datacenter: dc, worker: wk, sequence: seq },
      permalink_urn: permalinkUrn,
      query: qParams,
    });
  } catch (e) {
    alert("Error: " + (e && e.message ? e.message : e));
  }
})();
