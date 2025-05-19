async function loadLeaderboard() {
  try {
    const response = await fetch('leaderboard.json');
    const data = await response.json();
    const tbody = document.querySelector('#leaderboard tbody');

    const sortedInstances = Object.keys(data).sort();
    sortedInstances.forEach(instance => {
      const { best_cost, team } = data[instance];
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${instance}</td>
        <td>${best_cost}</td>
        <td>${team}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erro ao carregar leaderboard.json:", err);
    const tbody = document.querySelector('#leaderboard tbody');
    tbody.innerHTML = `<tr><td colspan="3">Erro ao carregar leaderboard.</td></tr>`;
  }
}

loadLeaderboard();

