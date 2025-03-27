document.addEventListener("DOMContentLoaded", () => {
    fetchData();
});
let currentAudio = null;

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

function playSong(videoUrl, title) {
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com/watch')) {
        const videoId = videoUrl.split('v=')[1];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

const nowPlayingElement = document.getElementById("nowPlaying");
    if (nowPlayingElement) {
        nowPlayingElement.innerHTML = `
            <p>Now Playing: <strong>${title}</strong></p>
            <div class="player-controls">
                <button onclick="window.open('${embedUrl}', '_blank')">
                 <i class="fas fa-external-link-alt"></i>  Watch Video 
                </button>
               <button class="save-btn" onclick="saveSong('${escapeString(title)}', '${videoUrl}')">
                        <i class="fas fa-heart"></i> Save
                    </button>
                </div>
                <iframe width="560" height="315" src="${embedUrl}" frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
            </div>
        `;
    }

}


function saveSong(title, videoUrl) {
    if (!title || !videoUrl) {
        alert("Missing info");
        return;
    }
    let savedSongs = JSON.parse(localStorage.getItem("savedSongs")) || [];

    const isAlreadySaved = savedSongs.some(song => 
        song.title === title && song.videoUrl === videoUrl
    );

    if (!isAlreadySaved) {
        savedSongs.push({
            title: title,
            videoUrl: videoUrl,
            savedAt: new Date().toISOString()
        });
        localStorage.setItem("savedSongs", JSON.stringify(savedSongs));
        alert(`"${title}" has been saved to your favorites!`);
        loadSavedSongs();
    } else {
        alert(`"${title}"  already in favorites!`);
    }
}
function loadSavedSongs() {
    const savedSongsContainer = document.getElementById("savedSongsContainer");
    if (!savedSongsContainer) return;
    const savedSongs = JSON.parse(localStorage.getItem("savesSongs")) || [];
    if (savedSongs.length === 0) {
        savedSongsContainer.innerHTML = `<p class="no-songs">No songs saved.</p>`;
        return;
    }
    savedSongsContainer.innerHTML =  `
    <h3>Your Saved Songs (${savedSongs.length})</h3>
    <ul class="saved-songs-list">
        ${savedSongs.map((song, index) => `
            <li>
                <span class="song-number">${index + 1}.</span>
                <span class="song-title">${song.title}</span>
                <div class="song-actions">
                    <button onclick="playSong('${song.videoUrl}', '${escapeString(song.title)}')">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button onclick="removeSavedSong(${index})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </li>
        `).join("")}
    </ul>
`;
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
            <li class="song-item">
                <span class="song-title">${song.title}</span>
                <div class="song-controls">
                    <button class="play-btn" onclick="playSong('${song.video_url}', '${escapeString(song.title)}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="save-btn" onclick="saveSong('${escapeString(song.title)}', '${song.video_url})'">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </li>
        `).join("");
    }
}

function escapeString(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

 async function loadRanking(artists) {
    const sortedArtists = [...artists].sort((a, b) => b.popularity - a.popularity);
    
    const overallRanking = document.getElementById("overallRanking");
    if (overallRanking) {
        overallRanking.innerHTML = sortedArtists.slice(0, 5).map((artist, index) => `
            <li>
                <div class="rank-number">${index + 1}</div>
                <div class="rank-info">
                    <div class="rank-image">
                        <img src="${artist.image}" alt="${artist.name}" class="rank-image" onclick="viewArtist('${artist.id}')">
                    </div>    
                    <h4>${artist.name}</h4>
                    <p>${artist.genre} • ★ ${artist.popularity}</p>
                    </div>
                </div>
            <li>   
        `).join("");
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
