/* ============================================================
   cloud.js — OPTIONAL live-results backend (Supabase).
   When a workshop "session code" is active, attendee responses
   are also sent here so the presenter can see live, aggregated
   results (results.html). Everything still works offline/per-
   attendee if this is absent or a session is not set.

   To disable the backend entirely: set URL_ or KEY to "".
   To point at a different Supabase project: replace URL_ + KEY
   (the publishable key is safe to ship in client code; row
   access is governed by the table's RLS policies).
   ============================================================ */
window.AILitCloud = (function () {
  var URL_  = "https://kudulsssoapxvqcnewxz.supabase.co";
  var KEY   = "sb_publishable_G08em6jMXaQzwrmO_aB0TQ_283NsDm-";
  var TABLE = "ailit_responses";
  var enabled = !!(URL_ && KEY);

  function clientId() {
    var k = "ailit:client", v = null;
    try { v = localStorage.getItem(k); } catch (e) {}
    if (!v) { v = "c_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      try { localStorage.setItem(k, v); } catch (e) {} }
    return v;
  }
  function headers(extra) {
    var h = { "apikey": KEY, "Authorization": "Bearer " + KEY, "Content-Type": "application/json" };
    for (var k in (extra || {})) h[k] = extra[k];
    return h;
  }
  function submit(session, activityId, activityType, value) {
    if (!enabled || !session) return Promise.resolve(false);
    var row = { session: session, activity_id: activityId, activity_type: activityType,
      client_id: clientId(), value: value, updated_at: new Date().toISOString() };
    return fetch(URL_ + "/rest/v1/" + TABLE + "?on_conflict=session,activity_id,client_id", {
      method: "POST",
      headers: headers({ "Prefer": "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify(row)
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }
  function fetchSession(session) {
    if (!enabled || !session) return Promise.resolve([]);
    var q = "?session=eq." + encodeURIComponent(session) +
      "&select=activity_id,activity_type,client_id,value,updated_at&order=updated_at.asc";
    return fetch(URL_ + "/rest/v1/" + TABLE + q, { headers: headers() })
      .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
  }
  return { enabled: enabled, url: URL_, clientId: clientId, submit: submit, fetchSession: fetchSession };
})();
