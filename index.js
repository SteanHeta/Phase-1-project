document.addEventListener("DOMContentLoaded", () => {
    fetchData();
});
function fetchData() {
    fetch("db.json")
    .then(res => res.json())
    .then(data => {
      if (document.getElementById("artistConsole")) {
        setUpArtistPortfolio(data.artists);
      }else {
        loadArtistSection(data.artists);
      }
        loadRanking(data.artists);
        loadSavedSongs();
    })
    .catch(error => console.error("Error fetching info", error));
}

function setUpArtistPortfolio(artists) {
    const artistConsole = document.getElementById("artistConsole");
    artistConsole.innerHTML = artists.map(artist => `
       <div class="artist-site">
       <h2>${artist.name}</h2>
       <img src="images/${artist.image}" onclick="viewArtist('${artist.id}')">
       <p>${artist.description}</p>
       <p>${artist.genre} | Popularity: ${artist.popularity}</p>
       </div>`).join("");
}

const searchSongs = document.getElementById("searchSongs");
if(searchSongs) {
    searchSongs.addEventListener("input", () => {
        let query = searchSongs.value;
        document.querySelectorAll(".artist-site").forEach(site =>{
            site.style.display = site.textContent.toLowerCase().includes(query.toLowerCase()) ? "" : "none";
        });
    });
}

const genreFilter = document.getElementById("genreFilter");
if(genreFilter) {
    genreFilter.addEventListener("change", () => {
        let genre = genreFilter.value;
        document.querySelectorAll(".artist-site").forEach(site =>{ 
            site.style.display = site.textContent.toLowerCase().includes(query.toLowerCase()) ? "" : "none";
            
        });
    });
}

const backgroundMusic = document.getElementById("backgroundMusic")
if(backgroundMusic) {
    backgroundMusic.addEventListener("ended", () => {
        backgroundMusic.play();
    });
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

    let saveSongsBtn = JSON.parse(localStorage.getItem("savedSongsBtn")) || [];
    saveSongsBtn.push({title, audioUrl, videoUrl});
    localStorage.getItem("savedSongsBtn", JSON.stringify(savedSongsBtn));
    loadSavedSongs();
}

function playSong(url) {
    if(!backgroundMusic) return;
    backgroundMusic.src = url;
    backgroundMusic.play();
}

function loadArtistSection(artists) {
    let artistid = new URLSearchParams(window.location.search).get("artist");
    let artist = artists.find(a => a.id === artistid);
    if(!artist) return;

    document.getElementById("artistName").textContent = artist.name;
    document.getElementById("artistImage").src =`images/${artist.image}`;
    document.getElementById("artistGenre").textContent = `Genre/${artist.genre}`;
    document.getElementById("artistPopularity").textContent = `Popularity/${artist.popularity}`;
    document.getElementById("artistDescription").textContent = artist.description;
    document.getElementById("artistSongs").innerHTML = artist.songs.map(song => `
        <li>
        <p>${song.title}</p>
        <button onclick="playSong('${song.audio_url}')">Play audio</button>
         <button onclick="playSong('${song.video_url}')">Play video</button>
         <button onclick="savePlayinSong()">Save</button>
         </li>
         `).join("");
}

function loadSavedSongs() {
    let savedSongsBtn = JSON.parse(localStorage.getItem("savedSongsBtn")) || [];
    const savedSongsBtnList = document.getElementById("savedSongsBtnList");
    if(!savedSongsBtnList) return;
    savedSongsBtnList.innerHTML = savedSongsBtn.map(song => `<li>${song.title}</li>`).join("");
}