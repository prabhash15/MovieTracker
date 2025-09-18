
document.getElementById("searchBtn").addEventListener("click", search);
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") search();
});

async function search() {
  const movieName = document.getElementById("searchInput").value.trim();
  if (!movieName) return alert("Enter a movie name!");

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p>🔍 Searching...</p>";

  try {
    const response = await fetch(`http://localhost:8000/movie/${movieName}`);
    const data = await response.json();

    if (!data || data.Response === "False") {
      resultDiv.innerHTML = "<p>❌ Movie not found.</p>";
      return;
    }

    // Build nice card UI
    resultDiv.innerHTML = `
      <div class="movie-card">
        <img class="movie-poster" src="${data.Poster}" alt="${data.Title}" />
        <div class="movie-info">
          <h2>${data.Title} (${data.Year})</h2>
          <p><strong>Genre:</strong> ${data.Genre}</p>
          <p><strong>Director:</strong> ${data.Director}</p>
          <p><strong>Actors:</strong> ${data.Actors}</p>
          <p><strong>Plot:</strong> ${data.Plot}</p>
          <p><strong>IMDB Rating:</strong> ⭐ ${data.imdbRating} (${data.imdbVotes} votes)</p>
          <p><strong>Awards:</strong> ${data.Awards}</p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "<p>⚠️ Something went wrong.</p>";
  }
}

