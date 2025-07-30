async function loadLeaderboard() {
  const response = await fetch("leaderboard.json");
  const data = await response.json();
  const currentTime = data.current_time;
  delete data.current_time;

  const instanceSelect = document.getElementById("instance-select");
  const tableHeaders = document.getElementById("table-headers");
  const tableBody = document.getElementById("leaderboard-body");

  for (const instance of Object.keys(data).sort()) {
    const option = document.createElement("option");
    option.value = instance;
    option.textContent = instance;
    instanceSelect.appendChild(option);
  }

  instanceSelect.addEventListener("change", () => renderTable(instanceSelect.value));

  function renderTable(mode) {
    tableHeaders.innerHTML = "";
    tableBody.innerHTML = "";

    if (mode === "global") {
      const teamStats = {};
      for (const [inst, submissions] of Object.entries(data)) {
        const best = submissions.at(-1);
        if (!teamStats[best.team]) {
          teamStats[best.team] = { total: 0, last: 0 };
        }
        teamStats[best.team].total += best.lead_time;
        teamStats[best.team].last = Math.max(teamStats[best.team].last, best.timestamp);
      }

      const sortedTeams = Object.entries(teamStats).sort((a, b) => a[1].total - b[1].total);
      tableHeaders.innerHTML = "<th>Place</th><th>Team</th><th>Global Score (days)</th><th>Last Submission</th>";

      sortedTeams.forEach(([team, info], index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${team}</td>
          <td>${info.total.toFixed(2)}</td>
          <td>${(info.last / 86400).toFixed(2)} d</td>
        `;
        tableBody.appendChild(row);
      });

    } else {
      tableHeaders.innerHTML = "<th>Rank</th><th>BKS</th><th>Team</th><th>Submission Date</th><th>Lead Time (days)</th>";
      const submissions = data[mode].slice().sort((a, b) => a.timestamp - b.timestamp);

      submissions.forEach((entry, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${i + 1}</td>
          <td>${entry.bks_value}</td>
          <td>${entry.team}</td>
          <td>${entry.submission_date}</td>
          <td>${entry.lead_time.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
      });
    }
  }

  renderTable("global");
}

loadLeaderboard();


