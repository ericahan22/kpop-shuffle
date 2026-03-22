// Configuration
const YOUTUBE_API_KEY = '';
const LASTFM_API_KEY = '1a3001dfbf71ca9dd816e9d666519d21';
const MUSICBRAINZ_API = 'https://beta.musicbrainz.org/ws/2';
const UNWANTED_RELEASE_TYPES = ['Interview', 'Live', 'DJ-mix'];
const MUSICBRAINZ_DELAY_MS = 1100;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Utility: randomly selects from array
function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Utility: fetch with error handling
async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        throw error;
    }
}

// Utility: fetch data (URL or plain text)
async function getData(source) {
    if (source.includes("http")) {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
    }
    return source;
}

// Get artist name from source (URL or direct input)
async function getArtistName(source) {
    const data = await getData(source);
    if (source.includes("http")) {
        const artistList = data.split(",").map(a => a.trim()).filter(a => a);
        return pickRandom(artistList);
    }
    return data;
}

// Get artist ID from MusicBrainz
async function getArtistId(artistName) {
    const url = `${MUSICBRAINZ_API}/artist?query=${encodeURIComponent(artistName)}&fmt=json`;
    const response = await fetchJSON(url);
    
    for (const artist of response.artists) {
        if (artist.country === "KR") {
            return { id: artist.id, name: artist.name };
        }
    }
    throw new Error(`No Korean artist found for "${artistName}"`);
}

// Get releases for an artist
async function getValidReleases(artistId) {
    const url = `${MUSICBRAINZ_API}/release?artist=${artistId}&inc=release-groups+recordings&fmt=json`;
    const response = await fetchJSON(url);
    
    const validReleases = response.releases.filter(release => {
        const secondaryTypes = release['release-group']['secondary-types'] || [];
        const hasNoUnwantedTypes = !secondaryTypes.some(type => UNWANTED_RELEASE_TYPES.includes(type));
        const hasTracks = release.media && release.media.length > 0;
        return hasNoUnwantedTypes && hasTracks;
    });
    
    if (validReleases.length === 0) {
        throw new Error("No valid releases found");
    }
    
    return validReleases;
}

// Get track from a release
function getTrackFromRelease(release) {
    const tracks = release.media[0].tracks.map(t => t.title);
    return pickRandom(tracks);
}

// Get YouTube video ID for a track
async function getYouTubeVideoId(artist, track) {
    const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q="${encodeURIComponent(artist)}" "${encodeURIComponent(track)}"&key=${YOUTUBE_API_KEY}`;
    
    try {
        const response = await fetchJSON(url);
        return response.items[0].id.videoId;
    } catch (error) {
        console.warn("YouTube search failed:", error);
        return null;
    }
}

// Display result on page
function displayResult(artist, track, videoId = null) {
    document.getElementById("loading").style.visibility = "hidden";
    const displayText = `${artist} - ${track}`;
    document.getElementById("txt").innerHTML = displayText;
    
    if (videoId) {
        document.getElementById("vid").src = `https://www.youtube.com/embed/${videoId}`;
    } else {
        document.getElementById("vid").src = "about:blank";
    }
}

// Main function: get random song and display
async function getSongAndDisplay(source) {
    document.getElementById("loading").style.visibility = "visible";
    document.getElementById("txt").innerHTML = "";
    try {
        const artistName = await getArtistName(source);
        const { id: artistId, name: displayName } = await getArtistId(artistName);
        const releases = await getValidReleases(artistId);
        const release = pickRandom(releases);
        const track = getTrackFromRelease(release);
        
        const skipVideo = document.getElementById("videoCheck").checked;
        
        if (skipVideo) {
            displayResult(displayName, track);
        } else {
            const videoId = await getYouTubeVideoId(displayName, track);
            displayResult(displayName, track, videoId);
        }
    } catch (error) {
        document.getElementById("loading").style.visibility = "hidden";
        console.error("Error getting song:", error);
        document.getElementById("txt").innerHTML = `Error: ${error.message}`;
    }
}

// Validate input contains alphanumeric characters
function isValidInput(inputText) {
    return /[a-zA-Z0-9]/.test(inputText);
}

// Handle user input from text box
function onInput() {
    const inputText = document.getElementById("input").value.trim();
    if (isValidInput(inputText)) {
        getSongAndDisplay(inputText);
    }
}

// Handle personalized results from Last.fm username
async function onSearch() {
    const username = document.getElementById("search").value.trim();
    if (!username) return;

    document.getElementById("loading").style.visibility = "visible";
    document.getElementById("txt").innerHTML = "";

    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=${encodeURIComponent(username)}&api_key=${LASTFM_API_KEY}&format=json&limit=50`;
        const data = await fetchJSON(url);

        // Shuffle and try up to 5 artists in case some have no Korean MusicBrainz entry
        const artists = [...data.topartists.artist.map(a => a.name)].sort(() => Math.random() - 0.5);
        for (const artist of artists.slice(0, 5)) {
            try {
                await getSongAndDisplay(artist);
                return;
            } catch {
                // reset loading state and try next artist after delay
                await sleep(MUSICBRAINZ_DELAY_MS);
                document.getElementById("loading").style.visibility = "visible";
                document.getElementById("txt").innerHTML = "";
            }
        }
        throw new Error("No Korean artists found in your Last.fm top artists");
    } catch (error) {
        document.getElementById("loading").style.visibility = "hidden";
        document.getElementById("txt").innerHTML = `Error: ${error.message}`;
    }
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", function() {
    document.getElementById("vid").src = "about:blank";
});

// Button event listeners
document.getElementById("butArt").addEventListener("click", () => {
    getSongAndDisplay("https://ericahan22.github.io/kpop-shuffle/database/artists.txt");
});

document.getElementById("butPop").addEventListener("click", () => {
    getSongAndDisplay("https://ericahan22.github.io/kpop-shuffle/database/popular.txt");
});

document.getElementById("butFavs").addEventListener("click", async () => {
    try {
        const favs = await fetchJSON("https://ericahan22.github.io/kpop-shuffle/database/favs.json");
        const selectedFav = pickRandom(favs);
        document.getElementById("vid").src = selectedFav[1];
        document.getElementById("txt").innerHTML = selectedFav[0];
    } catch (error) {
        console.error("Failed to load favourites:", error);
    }
});

document.getElementById("butFem").addEventListener("click", () => {
    getSongAndDisplay("https://ericahan22.github.io/kpop-shuffle/database/female.txt");
});

document.getElementById("butMal").addEventListener("click", () => {
    getSongAndDisplay("https://ericahan22.github.io/kpop-shuffle/database/male.txt");
});

document.getElementById("butNuguAll").addEventListener("click", () => {
    getSongAndDisplay("https://ericahan22.github.io/kpop-shuffle/database/nuguAll.txt");
});

document.getElementById("butNuguFem").addEventListener("click", () => {
    getSongAndDisplay("https://ericahan22.github.io/kpop-shuffle/database/nuguFem.txt");
});

document.getElementById("butNuguMal").addEventListener("click", () => {
    getSongAndDisplay("https://ericahan22.github.io/kpop-shuffle/database/nuguMal.txt");
});

document.getElementById("butInput").addEventListener("click", onInput);

document.getElementById("input").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        onInput();
    }
});

document.getElementById("butSearch").addEventListener("click", onSearch);

document.getElementById("search").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        onSearch();
    }
});
