async function listPlaylists() {
    const playlistsDiv = document.getElementById("playlists");

    if (!playlistsDiv) {
        return;
    }

    playlistsDiv.innerText = "Here by playlists";

    let playlists = await getPlaylistBatch();
    console.log(playlists);
    

}

async function getPlaylistBatch(offset: number = 0, playlists: any[] = []) {
    const token = localStorage.getItem("access_token");

    if (!token) {
        return [];
    }

    const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=50&offset=0", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (res.status != 200) {
        console.log("Unable to fetch user");
        console.error(res);
    } else {
        const playlistData = await res.json();
        return playlistData;

    }
}

listPlaylists();