// "Which trip fits you?" quiz.
// Each answer adds points to one or more destinations; the highest total wins.
(function () {
  "use strict";

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

  // Points per answer. Keep in sync with the options in index.html.
  var SCORES = {
    who: {
      littleKids: { wdw: 2, dcl: 1, aulani: 1 },
      teens:      { wdw: 2, dcl: 2 },
      adults:     { aulani: 2, dcl: 2 },
      firstTime:  { dlr: 2, wdw: 1 }
    },
    budget: {
      low:  { dlr: 3, dcl: 1 },
      mid:  { wdw: 2, dcl: 2, dlr: 1 },
      high: { aulani: 3, wdw: 1, dcl: 1 }
    },
    length: {
      short:  { dlr: 3, dcl: 1 },
      medium: { dcl: 2, wdw: 1, dlr: 1 },
      long:   { wdw: 3, aulani: 2 }
    },
    vibe: {
      thrills: { wdw: 2, dlr: 2 },
      relax:   { aulani: 3 },
      easy:    { dcl: 3 },
      quick:   { dlr: 3 }
    }
  };

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
  var current = 0;

  function selected(step) {
    return step.querySelector("input:checked");
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

  function score() {
    var totals = { wdw: 0, dlr: 0, aulani: 0, dcl: 0 };
    var vibePoints = { wdw: 0, dlr: 0, aulani: 0, dcl: 0 };

    steps.forEach(function (step) {
      var input = selected(step);
      var points = SCORES[input.name][input.value];
      Object.keys(points).forEach(function (key) {
        totals[key] += points[key];
        if (input.name === "vibe") vibePoints[key] += points[key];
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
    form.hidden = true;
    result.hidden = false;
    result.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!selected(steps[current])) {
      errorEl.textContent = "Pick an answer to keep going.";
      return;
    }
    if (current < steps.length - 1) show(current + 1, true);
    else showResult();
  });

  backBtn.addEventListener("click", function () {
    if (current > 0) show(current - 1, true);
  });

  form.addEventListener("change", function () { errorEl.textContent = ""; });

  document.getElementById("quiz-restart").addEventListener("click", function () {
    form.reset();
    result.hidden = true;
    form.hidden = false;
    show(0, true);
  });

  show(0, false);
})();
