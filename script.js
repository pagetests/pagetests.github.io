async function loadLeaderboard() {
  const response = await fetch("leaderboard.json");
  const data = await response.json();


  const startDate = new Date(data.starting_date);
  const now = new Date();
  const currentTime = Math.floor((now - startDate) / 1000);
  document.getElementById("current-time-display").textContent =
  `Current Time: ${(currentTime).toFixed(0)} seconds (${(currentTime / 86400).toFixed(2)} days)`;

  delete data.starting_date;

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
        const validSubs = submissions.slice(1); // ignorar a submissão neutra
    
        for (const sub of validSubs) {
          if (!teamStats[sub.team]) {
            teamStats[sub.team] = {
              total: 0,
              last: 0,
              last_instance: "",
              last_date: ""
            };
          }
    
          teamStats[sub.team].total += sub.lead_time;
    
          if (sub.timestamp > teamStats[sub.team].last) {
            teamStats[sub.team].last = sub.timestamp;
            teamStats[sub.team].last_instance = inst;
            teamStats[sub.team].last_date = sub.submission_date;
          }
        }
      }
    
      const sortedTeams = Object.entries(teamStats).sort(
        (a, b) => b[1].total - a[1].total
      );
    
      tableHeaders.innerHTML = `
        <th>Place</th>
        <th>Team</th>
        <th>Global Score (days)</th>
        <th>Last Update</th>
      `;
    
      sortedTeams.forEach(([team, info], index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${team}</td>
          <td>${info.total.toFixed(2)}</td>
          <td>${new Date(info.last_date).toLocaleString("en-GB")} (${info.last_instance})</td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      tableHeaders.innerHTML = "<th>BKS value</th><th>Submission Date</th><th>Time Stamp (secs)</th><th>Lead Time (days)</th><th>Team</th>";
      const submissions = data[mode].slice().sort((a, b) => a.timestamp - b.timestamp);

      submissions.forEach((entry, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${entry.bks_value}</td>
          <td>${new Date(entry.submission_date).toLocaleString("en-GB")}</td>
          <td>${entry.timestamp}</td>
          <td>${entry.lead_time.toFixed(2)}</td>
          <td>${entry.team}</td>
        `;
        tableBody.appendChild(row);
      });
    }
  }

  renderTable("global");

  // Render global solution updates as messages
  const updatesList = document.getElementById("updates-list");
  const allUpdates = [];

  for (const [instance, submissions] of Object.entries(data)) {
    submissions.forEach((sub, index) => {
      allUpdates.push({
        ...sub,
        instance,
        is_initial: index === 0
      });
    });
  }  

  // Sort by timestamp descending
  allUpdates.sort((a, b) => b.timestamp - a.timestamp);

  for (const update of allUpdates) {
    const li = document.createElement("li");
    const dateStr = new Date(update.submission_date).toLocaleString("en-GB");

    if (!update.is_initial) {
      //li.textContent = `[${dateStr}]: Initial BKS for instance ${update.instance} — cost ${update.bks_value}`;
    //} else {
      li.textContent = `[${dateStr}]: BKS update for instance ${update.instance} — cost ${update.bks_value} by team ${update.team}`;
    }    

    updatesList.appendChild(li);
}


}

loadLeaderboard();

