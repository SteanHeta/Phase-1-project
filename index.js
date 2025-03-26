document.addEventListener("DOMContentLoaded", () => {
    fetchData();
});
function fetchData() {
    fetch("http://localhost:3000/artists")
    .then(res => {
        if(!res.ok) {
            throw new Error('Network not responding')
        }
       return res.json();
 })

    .then(data => {
      if (document.getElementById("artistConsole")) {
        setUpArtistPortfolio(data);
        setupEventListeners();
        loadRanking(data);
        loadSavedSongs();
      }else if (document.getElementById("artistName")){
        loadArtistSection(data);
      }
        
    })
    .catch(error => {console.error("Error fetching info", error);
});
}

function setUpArtistPortfolio(artists) {
    const artistConsole = document.getElementById("artistConsole");
    if (!artistConsole) return;
    artistConsole.innerHTML = artists.map(artist => `
       <div class="artist-site" data-genre="${artist.genre.toLowerCase()}">
            <img src="${artist.image}" alt="${artist.name}" class="artist-image" onclick="viewArtist('${artist.id}')">
            <div class="artist-tea">
                <h2>${artist.name}</h2>
                <span class="genre-badge">${artist.genre}</span>
                <span class="popularity">★ ${artist.popularity}</span>
                <p>${artist.description || ''}</p>
            </div>
       </div>
    `).join("");
}

function setupEventListeners () {
const searchSongs = document.getElementById("searchSongs");
if(searchSongs) {
    searchSongs.addEventListener("input", () => {
        const query = searchSongs.value.toLowerCase();
        document.querySelectorAll(".artist-site").forEach(site => {
            const matchesSearch = site.textContent.toLowerCase().includes(query);
            site.style.display = matchesSearch ? "" : "none";
        });
    });
}

const genreFilter = document.getElementById("genreFilter");
    if(genreFilter) {
        genreFilter.addEventListener("change", () => {
            const genre = genreFilter.value.toLowerCase();
            document.querySelectorAll(".artist-site").forEach(site => { 
                const matchesGenre = genre ==="" || site.dataset.genre.includes(genre);
                site.style.display = matchesGenre ? "" : "none";
            
             });
        });
    }
}

function viewArtist(id) {
    window.location.href = `2index.html?artist=${id}`;
}

const saveSongsBtn = document.getElementById("saveSongsBtn");
if(saveSongsBtn) {
    saveSongsBtn.addEventListener("click", savePlayingSong);
}
function savePlayingSong() {
    let title = document.getElementById("playingSongTitle")?.textContent;
    let videoUrl = document.getElementById("playingSongVideo")?.src;
    if(!title || !videoUrl) return;

    let savedSongs = JSON.parse(localStorage.getItem("savedSongsBtn")) || [];
    saveSongsBtn.push({title, audioUrl, videoUrl});
    localStorage.setItem("savedSongsBtn", JSON.stringify(savedSongsBtn));
    loadSavedSongs();
}

function playVideo(url) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    window.open(url, '_blank');
}

function saveSong(title, videoUrl) {
    if (!title || !videoUrl) {
        alert("Missing info");
        return;
    }
    let savedSongs = JSON.parse(localStorage.getItem("savedSongs")) || [];

    if (!savedSongs.some(song => song.title === title)) {
        savedSongs.push({
            title: title,
            videoUrl: videoUrl,
        });
        localStorage.setItem("savedSongs", JSON.stringify(savedSongs));
        alert(`the song ${title} successfully saved`);
        loadSavedSongs();
        } else {
            alert(`the song ${title} already saved`);
    }
}

function loadArtistSection(artists) {
    let artistid = new URLSearchParams(window.location.search).get("artist");
    let artist = artists.find(a => a.id.toString() === artistid);
    if(!artist) return;

    document.getElementById("artistName").textContent = artist.name;
    document.getElementById("artistImage").src =artist.image;
    document.getElementById("artistGenre").textContent = `Genre: ${artist.genre}`;
    document.getElementById("artistPopularity").textContent = `Popularity: ${artist.popularity}`;
    document.getElementById("artistDescription").textContent = artist.description || '';

    const songsQueue = document.getElementById("artistSongs");
    if (songsQueue) {
    songsQueue.innerHTML = artist.songs.map(song => `
        <li class="song-item>
            <span class="song-title">${song.title}</span>
            <div class="song-control">
                <button class="play-video" onclick="playVideo('${song.video_url}')"></button>
                 <button class="save-song" onclick="savesong('${escapeString(song.title)}', '${song.video_url}')"></button>
            </div>
         </li>
         `).join("");
    }
}

function escapeString(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
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
    if (isNaN(rating) || rating < 1 || rating > 10) {
        alert("Please enter a valid rating between 1 and 10");
        return;
    }
    const artistName = document.getElementById("artistName")?.textContent || "The artist";
    alert(`Thank you for rating ${artistName} with ${rating} stars!`);
}