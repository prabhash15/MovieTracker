document.getElementById("searchBtn").addEventListener("click", search);
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") search();
});

// Fetch rated movies on load
window.addEventListener("DOMContentLoaded", loadRatedMovies);

async function loadRatedMovies() {
  try {
    const response = await fetch("http://localhost:8000/movie/ratedbyme");
    if (!response.ok) throw new Error(`Failed to load rated movies: ${response.status}`);

    const movies = await response.json();
    renderRatedMovies(movies);
  } catch (err) {
    console.error("Error loading rated movies:", err);
    document.getElementById("ratedMovies").innerHTML = "<p>⚠️ Could not load rated movies.</p>";
  }
}

function renderRatedMovies(movies) {
  const ratedDiv = document.getElementById("ratedMovies");
  if (!movies || movies.length === 0) {
    ratedDiv.innerHTML = "<p>No movies rated yet.</p>";
    return;
  }

  // Reverse the array to show most recently added movies first
  const reversedMovies = [...movies].reverse();

  ratedDiv.innerHTML = `
    <div class="rated-container">
      <div class="rated-grid-wrapper">
        <div class="rated-grid" id="moviesGrid">
          ${reversedMovies.map(m => `
            <div class="rated-card" data-movie-id="${m.imdbID || m.Title}">
              <div class="rated-card-content">
                <img class="rated-poster" src="${m.Poster}" alt="${m.Title}">
                <div class="rated-info">
                  <div class="rated-title">${m.Title}</div>
                  <div class="rated-rating">⭐ ${m.userRating}</div>
                </div>
                <div class="delete-overlay">
                  <button class="delete-btn" onclick="deleteMovie('${m.imdbID || m.Title}', '${m.Title}')">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  
}

async function deleteMovie(movieId, movieTitle) {
  try {
    // Show loading state
    showPopup("⏳ Deleting movie...");
    
    const response = await fetch(`http://localhost:8000/movie/delete/${encodeURIComponent(movieId)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete movie: ${response.status}`);
    }

    const result = await response.json();
    showPopup(`✅ "${movieTitle}" deleted successfully!`);

    // Refresh the rated movies list
    await loadRatedMovies();

  } catch (err) {
    console.error("Delete movie error:", err);
    showPopup("⚠️ Failed to delete movie.");
  }
}

function scrollMovies(direction) {
  const grid = document.getElementById("moviesGrid");
  const scrollAmount = 200; // Scroll by ~1.2 movie cards
  
  if (direction === 'left') {
    grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

async function search() {
  const movieName = document.getElementById("searchInput").value.trim();
  if (!movieName) return showPopup("⚠️ Enter a movie name!");

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p>⏳ Searching...</p>";

  try {
    const response = await fetch(`http://localhost:8000/movie/${encodeURIComponent(movieName)}`);
    const data = await response.json();

    if (!data || data.Response === "False") {
      resultDiv.innerHTML = "<p>❌ Movie not found.</p>";
      return;
    }

    resultDiv.innerHTML = `
      <div class="movie-card">
        <img class="movie-poster" src="${data.Poster}" alt="${data.Title}" />
        <div class="movie-info">
          <h2>${data.Title} (${data.Year})</h2>
          <p><strong>🎭 Genre:</strong> ${data.Genre}</p>
          <p><strong>🎬 Director:</strong> ${data.Director}</p>
          <p><strong>⭐ Cast:</strong> ${data.Actors}</p>
          <p><strong>📖 Plot:</strong> ${data.Plot}</p>
          <p><strong>🌟 IMDB Rating:</strong> ${data.imdbRating} (${data.imdbVotes} votes)</p>
          <p><strong>🏆 Awards:</strong> ${data.Awards}</p>

          <label for="userRating"><strong>📝 Your Rating (1–10):</strong></label>
          <input type="number" id="userRating" min="1" max="10" placeholder="Rate here" />

          <button id="saveBtn">💾 Save Movie</button>
        </div>
      </div>
    `;

    document.getElementById("saveBtn").addEventListener("click", () => saveMovie(data));

  } catch (err) {
    console.error("Search error:", err);
    showPopup("⚠️ Something went wrong during search.");
  }
}

async function saveMovie(movieData) {
  try {
    const ratingInput = document.getElementById("userRating");
    const userRating = ratingInput ? ratingInput.value.trim() : null;

    const payload = {
      ...movieData,
      userRating: userRating || "Not Rated"
    };

    const response = await fetch("http://localhost:8000/movie/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    showPopup(`✅ Saved "${movieData.Title}" with your rating: ${payload.userRating}`);

    // Reload rated movies section
    await loadRatedMovies();

  } catch (err) {
    console.error("Save movie error:", err);
    showPopup("⚠️ Failed to save movie.");
  }
}

/* Popup Function */
function showPopup(message) {
  const popup = document.getElementById("popup");
  popup.textContent = message;
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
}
