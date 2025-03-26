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
       <div class="artist-site">
       <div class="artist-image-container">
       <h2>${artist.name}</h2>
       <img src="${artist.image}" alt="${artist.name}" class="artist-image" onclick="viewArtist('${artist.id}')">
       <p>${artist.description || ''}</p>
       <p>${artist.genre} | Popularity: ${artist.popularity}</p>
       </div>`).join("");
}

function setupEventListeners () {
const searchSongs = document.getElementById("searchSongs");
if(searchSongs) {
    searchSongs.addEventListener("input", () => {
        const query = searchSongs.value.toLowerCase();
        document.querySelectorAll(".artist-site").forEach(site => {
            site.style.display = site.textContent.toLowerCase().includes(query) ? "" : "none";
        });
    });
}

const genreFilter = document.getElementById("genreFilter");
if(genreFilter) {
    genreFilter.addEventListener("change", () => {
        const genre = genreFilter.value.toLowerCase();
        document.querySelectorAll(".artist-site").forEach(site =>{ 
            site.style.display = genre === "" || site.textContent.toLowerCase().includes(genre) ? "" : "none";
            
        });
    });
}
}

function viewArtist(id) {
    window.location.href = `2 index.html?artist=${id}`;
}

const saveSongsBtn = document.getElementById("saveSongsBtn");
if(saveSongsBtn) {
    saveSongsBtn.addEventListener("click", savePlayingSong);
}
function savePlayingSong() {
    let title = document.getElementById("playingSongTitle")?.textContent;
    let audioUrl = document.getElementById("playingSongAudio")?.src;
    let videoUrl = document.getElementById("playingSongVideo")?.src;
    if(!title || !audioUrl || !videoUrl) return;

    let savedSongs = JSON.parse(localStorage.getItem("savedSongsBtn")) || [];
    saveSongsBtn.push({title, audioUrl, videoUrl});
    localStorage.setItem("savedSongsBtn", JSON.stringify(savedSongsBtn));
    loadSavedSongs();
}
const playAudio = url => (new Audio(url)).play().catch(e=>console.error("Audio error:",e));
const playVideo = url => window.open(url, '_blank');




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
        <li>
        <p>${song.title}</p>
        <button onclick="playSong('${song.audio_url}')">Play audio</button>
         <button onclick="playSong('${song.video_url}')">Play video</button>
         <button onclick="savePlayinSong('${song.title}', '${song.audio_url}', '${song.video_url}')">Save</button>
         </li>
         `).join("");
    }
}

function loadSavedSongs() {
    let savedSongs = JSON.parse(localStorage.getItem("savedSongs")) || [];
    const savedSongsList = document.getElementById("savedSongs");
    if(!savedSongsList) return;
    savedSongsList.innerHTML = savedSongs.map(song => `
        <li>
        ${song.title}
        <button onclick="playSong('${song.audioUrl}')">Play Audio</button>
        <button onclick="playSong('${song.videoUrl}')">Play Video</button>
        </li>`).join("");
}
function loadRanking(artists) {
    const sortedArtists = [...artists].sort((a, b) => b.popularity - a.popularity);
    
    const overallRanking = document.getElementById("overallRanking");
    if (overallRanking) {
        overallRanking.innerHTML = sortedArtists.slice(0, 3).map(artist => `
            <div>
                <h4>${artist.name}</h4>
                <p>Popularity: ${artist.popularity}</p>
            </div>
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
                <div>
                    <h4>${genre}</h4>
                    <p>Top Artist: ${topArtist.name} (${topArtist.popularity})</p>
                </div>
            `;
        }).join("");
    }
}

function submitRatingReview() {
    const rating = document.getElementById("artistRating").value;
    if (rating && rating >= 1 && rating <= 10) {
        alert(`Thank you for rating this artist with ${rating} stars!`);
    } else {
        alert("Please enter a valid rating between 1 and 10");
    }
}