
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

    // Build nice card UI with save button
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
          <button id="saveBtn">💾 Save Movie</button>
        </div>
      </div>
    `;

    // Attach click handler to save button
    document.getElementById("saveBtn").addEventListener("click", () => saveMovie(data));

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "<p>⚠️ Something went wrong.</p>";
  }
}

async function saveMovie(movieData) {
  try {
    const response = await fetch("http://localhost:8000/movie/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movieData)
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    alert(`✅ Movie saved: ${result.message || movieData.Title}`);
  } catch (err) {
    console.error(err);
    alert("⚠️ Failed to save movie.");
  }
}

