let currentAudio = null;
let artistsData = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchData();
});

function fetchData() {
    fetch("http://localhost:3000/artists")
        .then(res => {
            if (!res.ok) throw new Error('Network not responding');
            return res.json();
        })
        .then(data => {
            artistsData = data;
            if (document.getElementById("artistConsole")) {
                setUpArtistPortfolio(data);
                setupEventListeners();
                loadRanking(data);
                loadSavedSongs();
            } else if (document.getElementById("artistName")) {
                loadArtistSection(data);
            }
        })
        .catch(error => {
            console.error("Error fetching info", error);
            alert("Failed to load artist data. Please try again later.");
        });
}

function setUpArtistPortfolio(artists) {
    const artistConsole = document.getElementById("artistConsole");
    if (!artistConsole) return;
    
    artistConsole.innerHTML = artists.map(artist => `
        <div class="artist-card" data-genre="${artist.genre.toLowerCase()}">
            <img src="${artist.image}" alt="${artist.name}" class="artist-image" onclick="viewArtist('${artist.id}')">
            <div class="artist-info">
                <h2>${artist.name}</h2>
                <span class="genre-badge">${artist.genre}</span>
                <span class="popularity">★ ${artist.popularity}</span>
                <p>${artist.description || ''}</p>
            </div>
        </div>
    `).join("");
}

function setupEventListeners() {
    const searchSongs = document.getElementById("searchSongs");
    if (searchSongs) {
        searchSongs.addEventListener("input", () => {
            const query = searchSongs.value.toLowerCase();
            document.querySelectorAll(".artist-card").forEach(card => {
                const matchesSearch = card.textContent.toLowerCase().includes(query);
                card.style.display = matchesSearch ? "" : "none";
            });
        });
    }

    const genreFilter = document.getElementById("genreFilter");
    if (genreFilter) {
        genreFilter.addEventListener("change", () => {
            const genre = genreFilter.value.toLowerCase();
            document.querySelectorAll(".artist-card").forEach(card => {
                const matchesGenre = genre === "" || card.dataset.genre.includes(genre);
                card.style.display = matchesGenre ? "" : "none";
            });
        });
    }
}

function viewArtist(id) {
    window.location.href = `2index.html?artist=${id}`;
}

function playVideo(url) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
}

function saveSong(title, audioUrl, videoUrl) {
    if (!title || !audioUrl || !videoUrl) {
        alert("Missing song information");
        return;
    }

    let savedSongs = JSON.parse(localStorage.getItem("savedSongs")) || [];
    
    if (!savedSongs.some(song => song.title === title && song.audioUrl === audioUrl)) {
        savedSongs.push({
            title: title,
            audioUrl: audioUrl,
            videoUrl: videoUrl,
            savedAt: new Date().toISOString()
        });
        localStorage.setItem("savedSongs", JSON.stringify(savedSongs));
        alert(`"${title}" has been saved to your favorites!`);
        loadSavedSongs();
    } else {
        alert(`"${title}" is already in your saved songs!`);
    }
}

function loadArtistSection(artists) {
    let artistId = new URLSearchParams(window.location.search).get("artist");
    let artist = artists.find(a => a.id.toString() === artistId);
    if (!artist) return;

    document.getElementById("artistName").textContent = artist.name;
    document.getElementById("artistImage").src = artist.image;
    document.getElementById("artistGenre").textContent = artist.genre;
    document.getElementById("artistPopularity").textContent = `★ ${artist.popularity}`;
    document.getElementById("artistDescription").textContent = artist.description || '';
    
    const songsList = document.getElementById("artistSongs");
    if (songsList) {
        songsList.innerHTML = artist.songs.map(song => `
            <li class="song-item">
                <span class="song-title">${song.title}</span>
                <div class="song-controls">
                    <button class="play-audio" onclick="playAudio('${song.audio_url}')">
                        <i class="fas fa-music"></i> Play Audio
                    </button>
                    <button class="play-video" onclick="playVideo('${song.video_url}')">
                        <i class="fas fa-play"></i> Play Video
                    </button>
                    <button class="save-song" onclick="saveSong('${escapeString(song.title)}', '${song.audio_url}', '${song.video_url}')">
                        <i class="fas fa-bookmark"></i> Save
                    </button>
                </div>
            </li>
        `).join("");
    }
}

function escapeString(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function loadSavedSongs() {
    let savedSongs = JSON.parse(localStorage.getItem("savedSongs")) || [];
    const savedSongsList = document.getElementById("savedSongs");
    if (!savedSongsList) return;
    
    savedSongsList.innerHTML = savedSongs.map((song, index) => `
        <li class="song-item">
            <span class="song-title">${song.title}</span>
            <div class="song-controls">
                <button class="play-audio" onclick="playAudio('${song.audioUrl}')">
                    <i class="fas fa-music"></i> Play
                </button>
                <button onclick="removeSavedSong(${index})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </li>
    `).join("");
}

function removeSavedSong(index) {
    let savedSongs = JSON.parse(localStorage.getItem("savedSongs")) || [];
    if (index >= 0 && index < savedSongs.length) {
        const removedSong = savedSongs.splice(index, 1)[0];
        localStorage.setItem("savedSongs", JSON.stringify(savedSongs));
        alert(`Removed "${removedSong.title}" from saved songs`);
        loadSavedSongs();
    }
}

function loadRanking(artists) {
    const sortedArtists = [...artists].sort((a, b) => b.popularity - a.popularity);
    
    const overallRanking = document.getElementById("overallRanking");
    if (overallRanking) {
        overallRanking.innerHTML = sortedArtists.slice(0, 5).map((artist, index) => `
            <li>
                <div class="rank-number">${index + 1}</div>
                <div class="rank-info">
                    <h4>${artist.name}</h4>
                    <p>${artist.genre} • ★ ${artist.popularity}</p>
                </div>
                <img src="${artist.image}" alt="${artist.name}" class="rank-image" onclick="viewArtist('${artist.id}')">
            </li>
        `).join("");
    }

    const genreMap = {};
    artists.forEach(artist => {
        if (!genreMap[artist.genre]) {
            genreMap[artist.genre] = [];
        }
        genreMap[artist.genre].push(artist);
    });

    const genreRanking = document.getElementById("genreRanking");
    if (genreRanking) {
        genreRanking.innerHTML = Object.entries(genreMap).map(([genre, artists]) => {
            const topArtist = artists.sort((a, b) => b.popularity - a.popularity)[0];
            return `
                <div class="genre-ranking-item">
                    <div class="genre-title">${genre}</div>
                    <div class="artist-rank">
                        <img src="${topArtist.image}" alt="${topArtist.name}" class="rank-image" onclick="viewArtist('${topArtist.id}')">
                        <div>
                            <h4>${topArtist.name}</h4>
                            <p>★ ${topArtist.popularity}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }
}

function submitRatingReview() {
    const ratingInput = document.getElementById("artistRating");
    if (!ratingInput) return;
    
    const rating = parseInt(ratingInput.value);
    const artistName = document.getElementById("artistName")?.textContent || "this artist";
    
    let ratings = JSON.parse(localStorage.getItem("artistRatings")) || {};
    ratings[artistName] = rating;
    localStorage.setItem("artistRatings", JSON.stringify(ratings));
    
    alert(`Thank you for rating ${artistName} with ${rating} stars!`);
    ratingInput.value = "";
}