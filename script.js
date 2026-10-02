// Where Will the Magic Take Me?
// 1. "Which trip fits you?" quiz: each answer adds points; the highest total wins.
// 2. "Which trip is cheaper for your dates?": totals the quotes a visitor enters.

var DESTINATIONS = {
  wdw: {
    name: "Walt Disney World",
    icon: "#i-burst",
    reason: "Four theme parks and tickets for up to 10 days give you room for big rides, fireworks, and a trip you'll talk about for years."
  },
  dlr: {
    name: "Disneyland Resort",
    icon: "#i-sun",
    reason: "Two parks and 2- to 5-day ticket packages make it the easiest Disney trip to fit into a short getaway."
  },
  aulani: {
    name: "Aulani, A Disney Resort & Spa",
    icon: "#i-palm",
    reason: "Snorkeling, a lū‘au, a full spa, and free Hawaiian cultural activities make it the most relaxed Disney trip of the four."
  },
  dcl: {
    name: "Disney Cruise Line",
    icon: "#i-ship",
    reason: "You unpack once, and most meals, shows, pools, and kids' clubs come with the fare. Sailings run from 2 nights up."
  }
};

var money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function readNumber(input) {
  var n = parseFloat(input && input.value);
  return isFinite(n) && n > 0 ? n : 0;
}

/* ==========================================================================
   Quiz
   ========================================================================== */
(function () {
  "use strict";

  // Points per answer. Keep in sync with the options in index.html.
  var SCORES = {
    who: {
      littleKids: { wdw: 2, dcl: 1, aulani: 1 },
      teens:      { wdw: 2, dcl: 2 },
      adults:     { aulani: 2, dcl: 2 },
      solo:       { dlr: 2, wdw: 2 },
      older:      { dcl: 3, aulani: 2 },
      firstTime:  { dlr: 2, wdw: 1 }
    },
    length: {
      short:  { dlr: 3, dcl: 1 },
      medium: { dcl: 2, wdw: 1, dlr: 1 },
      long:   { wdw: 3, aulani: 2 }
    },
    budget: {
      low:  { dlr: 3, dcl: 1 },
      mid:  { wdw: 2, dcl: 2, dlr: 1 },
      high: { aulani: 3, wdw: 1, dcl: 1 }
    },
    vibe: {
      thrills: { wdw: 2, dlr: 2 },
      relax:   { aulani: 3 },
      easy:    { dcl: 3 },
      quick:   { dlr: 3 }
    }
  };

  // A typed budget is matched to the $ scale per person, per day.
  // Rough guide (author's estimate, shown on the page): <$250 = $, $250–$450 = $$, >$450 = $$$.
  var TRIP_DAYS = { short: 3, medium: 5, long: 7 };
  var TIER_LABEL = { low: "$", mid: "$$", high: "$$$" };
  function tierFor(perPersonPerDay) {
    if (perPersonPerDay < 250) return "low";
    if (perPersonPerDay <= 450) return "mid";
    return "high";
  }

  // Final tiebreak order (alphabetical by display name).
  var TIEBREAK = ["aulani", "dcl", "dlr", "wdw"];

  var form = document.getElementById("quiz-form");
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll(".question"));
  var stepLabel = document.getElementById("quiz-step");
  var progress = document.getElementById("progress-fill");
  var errorEl = document.getElementById("quiz-error");
  var backBtn = document.getElementById("quiz-back");
  var nextBtn = document.getElementById("quiz-next");
  var result = document.getElementById("quiz-result");
  var customPanel = document.getElementById("custom-budget");
  var amountInput = document.getElementById("quiz-amount");
  var travelersInput = document.getElementById("quiz-travelers");
  var budgetNote = document.getElementById("result-budget");
  var current = 0;

  function answer(name) {
    var input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : null;
  }

  function show(index, moveFocus) {
    current = index;
    steps.forEach(function (step, i) { step.hidden = i !== index; });
    stepLabel.textContent = "Question " + (index + 1) + " of " + steps.length;
    progress.style.width = ((index + 1) / steps.length) * 100 + "%";
    backBtn.disabled = index === 0;
    nextBtn.textContent = index === steps.length - 1 ? "See my trip" : "Next";
    errorEl.textContent = "";
    if (moveFocus) steps[index].querySelector("legend").focus();
  }

  // Returns an error message for the current step, or "" if it's complete.
  function validate(step) {
    var checked = step.querySelector("input[type=radio]:checked");
    if (!checked) return "Pick an answer to keep going.";
    if (checked.name === "budget" && checked.value === "custom") {
      var travelers = parseInt(travelersInput.value, 10);
      if (!readNumber(amountInput)) { amountInput.focus(); return "Enter your total budget in dollars."; }
      if (!(travelers >= 1 && travelers <= 20)) { travelersInput.focus(); return "Enter between 1 and 20 travelers."; }
    }
    return "";
  }

  function customBudget() {
    var amount = readNumber(amountInput);
    var travelers = parseInt(travelersInput.value, 10) || 1;
    var perDay = amount / travelers / TRIP_DAYS[answer("length")];
    return { amount: amount, travelers: travelers, perDay: perDay, tier: tierFor(perDay) };
  }

  function score() {
    var totals = { wdw: 0, dlr: 0, aulani: 0, dcl: 0 };
    var vibePoints = { wdw: 0, dlr: 0, aulani: 0, dcl: 0 };

    Object.keys(SCORES).forEach(function (question) {
      var value = answer(question);
      if (question === "budget" && value === "custom") value = customBudget().tier;
      var points = SCORES[question][value];
      Object.keys(points).forEach(function (key) {
        totals[key] += points[key];
        if (question === "vibe") vibePoints[key] += points[key];
      });
    });

    return TIEBREAK.slice().sort(function (a, b) {
      return (totals[b] - totals[a]) || (vibePoints[b] - vibePoints[a]) ||
        (TIEBREAK.indexOf(a) - TIEBREAK.indexOf(b));
    })[0];
  }

  function showResult() {
    var key = score();
    var dest = DESTINATIONS[key];
    document.getElementById("result-name").textContent = dest.name;
    document.getElementById("result-reason").textContent = dest.reason;
    document.getElementById("result-icon").setAttribute("href", dest.icon);
    document.getElementById("result-link").setAttribute("href", "#" + key);

    if (answer("budget") === "custom") {
      var b = customBudget();
      budgetNote.textContent = "Your " + money.format(b.amount) + " budget works out to about " +
        money.format(b.perDay) + " per person per day, which I treated as " + TIER_LABEL[b.tier] + ".";
      budgetNote.hidden = false;
      document.dispatchEvent(new CustomEvent("quiz:budget", { detail: b }));
    } else {
      budgetNote.hidden = true;
    }

    form.hidden = true;
    result.hidden = false;
    result.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var problem = validate(steps[current]);
    if (problem) { errorEl.textContent = problem; return; }
    if (current < steps.length - 1) show(current + 1, true);
    else showResult();
  });

  backBtn.addEventListener("click", function () {
    if (current > 0) show(current - 1, true);
  });

  form.addEventListener("change", function (event) {
    errorEl.textContent = "";
    if (event.target.name === "budget") customPanel.hidden = event.target.value !== "custom";
  });

  document.getElementById("quiz-restart").addEventListener("click", function () {
    form.reset();
    customPanel.hidden = true;
    result.hidden = true;
    form.hidden = false;
    show(0, true);
  });

  show(0, false);
})();

/* ==========================================================================
   Price your dates
   ========================================================================== */
(function () {
  "use strict";

  // Official event dates, verified September 30, 2026 (see Sources).
  var EVENTS = [
    { dest: "wdw", name: "Mickey's Not-So-Scary Halloween Party", start: "2026-08-07", end: "2026-10-31", note: "select nights, separate ticket",
      url: "https://disneyworld.disney.go.com/events-tours/magic-kingdom/mickeys-not-so-scary-halloween-party/" },
    { dest: "wdw", name: "EPCOT International Food & Wine Festival", start: "2026-08-27", end: "2026-11-21",
      url: "https://disneyworld.disney.go.com/events-tours/epcot/epcot-international-food-and-wine-festival/" },
    { dest: "wdw", name: "Mickey's Very Merry Christmas Party", start: "2026-11-08", end: "2026-12-22", note: "select nights, separate ticket",
      url: "https://disneyworld.disney.go.com/events-tours/magic-kingdom/mickeys-very-merry-christmas-party/" },
    { dest: "wdw", name: "EPCOT International Festival of the Arts", start: "2027-01-15", end: "2027-03-01",
      url: "https://disneyworld.disney.go.com/events-tours/epcot/epcot-international-festival-of-the-arts/" },
    { dest: "dlr", name: "Halloween Time", start: "2026-08-21", end: "2026-10-31",
      url: "https://disneyland.disney.go.com/events-tours/halloween-time-at-the-disneyland-resort/" },
    { dest: "dlr", name: "Disney Festival of Holidays", start: "2026-11-13", end: "2027-01-06",
      url: "https://disneyland.disney.go.com/events-tours/disney-california-adventure/festival-of-holidays/" }
  ];
  var EVENTS_KNOWN_UNTIL = "2027-03-01";
  var SHORT = { wdw: "Disney World", dlr: "Disneyland" };
  var STORAGE_KEY = "wwtmtm-prices-v1";
  var DAY = 86400000;

  var startInput = document.getElementById("trip-start");
  if (!startInput) return;
  var endInput = document.getElementById("trip-end");
  var travelersInput = document.getElementById("trip-travelers");
  var budgetInput = document.getElementById("trip-budget");
  var summary = document.getElementById("trip-summary");
  var dateError = document.getElementById("date-error");
  var happening = document.getElementById("happening");
  var happeningList = document.getElementById("happening-list");
  var happeningNote = document.getElementById("happening-note");
  var resultBox = document.getElementById("cost-result");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".cost-card"));
  var section = document.getElementById("cost");
  var allInputs = Array.prototype.slice.call(section.querySelectorAll("input"));

  function parseDate(value) {
    var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    return p ? Date.UTC(+p[1], +p[2] - 1, +p[3]) : null;
  }

  function formatRange(start, end) {
    var opts = { month: "short", day: "numeric", timeZone: "UTC" };
    var s = new Date(parseDate(start)), e = new Date(parseDate(end));
    var sameYear = s.getUTCFullYear() === e.getUTCFullYear();
    return s.toLocaleDateString("en-US", sameYear ? opts : Object.assign({ year: "numeric" }, opts)) +
      "–" + e.toLocaleDateString("en-US", Object.assign({ year: "numeric" }, opts));
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // Returns { nights } for a valid range, or null (and shows why).
  function readTrip() {
    var start = parseDate(startInput.value), end = parseDate(endInput.value);
    dateError.textContent = "";
    if (start === null || end === null) return null;
    var nights = Math.round((end - start) / DAY);
    if (nights < 1) { dateError.textContent = "Your end date needs to be after your start date."; return null; }
    if (nights > 60) { dateError.textContent = "Pick a trip of 60 nights or fewer."; return null; }
    return { start: start, end: end, nights: nights };
  }

  function travelers() {
    var n = parseInt(travelersInput.value, 10);
    return n >= 1 && n <= 20 ? n : 0;
  }

  function renderTrip(trip) {
    var people = travelers();
    var who = people ? " · " + people + (people === 1 ? " traveler" : " travelers") : "";
    summary.textContent = trip
      ? trip.nights + (trip.nights === 1 ? " night, " : " nights, ") + (trip.nights + 1) + " days" + who
      : "Pick your dates to get started.";

    happeningList.textContent = "";
    if (!trip) { happening.hidden = true; return; }

    EVENTS.forEach(function (event) {
      if (parseDate(event.start) > trip.end || parseDate(event.end) < trip.start) return;
      var item = el("li");
      item.appendChild(el("strong", null, SHORT[event.dest]));
      var link = el("a", null, event.name);
      link.href = event.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.appendChild(el("span", "sr-only", " (opens in a new tab)"));
      item.appendChild(link);
      item.appendChild(el("span", "event-dates",
        formatRange(event.start, event.end) + (event.note ? " · " + event.note : "")));
      happeningList.appendChild(item);
    });

    var notes = [];
    if (!happeningList.children.length) notes.push("No official park events are listed for these dates.");
    if (trip.end > parseDate(EVENTS_KNOWN_UNTIL)) notes.push("Events after March 1, 2027 hadn't been announced when this was researched.");
    happeningNote.textContent = notes.join(" ");
    var cruise = el("span", null, " For themed cruises, see ");
    var cruiseLink = el("a", null, "Disney Cruise Line's seasonal sailings");
    cruiseLink.href = "https://disneycruise.disney.go.com/specialty-cruises/";
    cruiseLink.target = "_blank";
    cruiseLink.rel = "noopener";
    cruise.appendChild(cruiseLink);
    cruise.appendChild(document.createTextNode("."));
    happeningNote.appendChild(cruise);
    happening.hidden = false;
  }

  function renderCosts(trip) {
    var people = travelers();
    var budget = readNumber(budgetInput);
    var priced = [];

    cards.forEach(function (card) {
      var inputs = card.querySelectorAll("input[data-cost]");
      var total = 0, any = false;
      Array.prototype.forEach.call(inputs, function (input) {
        if (input.value !== "") any = true;
        total += readNumber(input);
      });

      var totalEl = card.querySelector("[data-total]");
      var meta = card.querySelector("[data-meta]");
      meta.textContent = "";
      card.classList.remove("is-cheapest");

      if (!any || total === 0) { totalEl.textContent = "—"; return; }

      totalEl.textContent = money.format(total);
      var parts = [];
      if (people > 1) parts.push(money.format(total / people) + " per person");
      if (trip) parts.push(money.format(total / trip.nights) + " per night");
      if (parts.length) meta.appendChild(el("span", null, parts.join(" · ")));
      if (budget) {
        var diff = budget - total;
        meta.appendChild(el("span", diff >= 0 ? "budget-ok" : "budget-over",
          diff >= 0 ? "Within budget, " + money.format(diff) + " to spare" : money.format(-diff) + " over budget"));
      }
      priced.push({ card: card, key: card.getAttribute("data-dest"), total: total });
    });

    resultBox.textContent = "";
    if (priced.length < 2) {
      resultBox.appendChild(el("p", null, priced.length
        ? "Add prices for at least one more trip to compare."
        : "Add prices for at least two trips to see which is cheaper."));
      return;
    }

    priced.sort(function (a, b) { return a.total - b.total; });
    var best = priced[0], next = priced[1];
    var line = el("p");

    if (best.total === next.total) {
      line.appendChild(el("strong", null, DESTINATIONS[best.key].name + " and " + DESTINATIONS[next.key].name));
      line.appendChild(document.createTextNode(" cost the same, " + money.format(best.total) + "."));
    } else {
      best.card.classList.add("is-cheapest");
      line.appendChild(el("strong", null, DESTINATIONS[best.key].name));
      line.appendChild(document.createTextNode(" is the cheapest of the " + priced.length + " trips you priced at " +
        money.format(best.total) + ", " + money.format(next.total - best.total) + " less than " +
        DESTINATIONS[next.key].name + "."));
    }
    resultBox.appendChild(line);
    resultBox.appendChild(el("p", "note",
      "For a fair comparison, make sure each trip includes the same kinds of costs, like getting there and food."));
  }

  function update() {
    var trip = readTrip();
    renderTrip(trip);
    renderCosts(trip);
  }

  // Browser storage is a convenience only; the page works without it.
  function save() {
    var data = {};
    allInputs.forEach(function (input) { data[input.id] = input.value; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* storage unavailable */ }
  }

  function restore() {
    var data;
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (e) { data = null; }
    if (!data) return;
    allInputs.forEach(function (input) {
      if (typeof data[input.id] === "string") input.value = data[input.id];
    });
  }

  // Dates can't start in the past.
  var now = new Date();
  var today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  startInput.min = today;
  endInput.min = today;

  startInput.addEventListener("change", function () {
    if (startInput.value) endInput.min = startInput.value;
  });

  section.addEventListener("input", function () { update(); save(); });

  document.getElementById("cost-clear").addEventListener("click", function () {
    allInputs.forEach(function (input) { input.value = input.id === "trip-travelers" ? "2" : ""; });
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
    endInput.min = today;
    update();
    startInput.focus();
  });

  // A budget typed into the quiz carries over if this section's budget is empty.
  document.addEventListener("quiz:budget", function (event) {
    if (budgetInput.value) return;
    budgetInput.value = Math.round(event.detail.amount);
    travelersInput.value = event.detail.travelers;
    update();
    save();
  });

  restore();
  update();
})();
