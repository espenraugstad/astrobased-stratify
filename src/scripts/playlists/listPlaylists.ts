async function listPlaylists() {
    const playlistsDiv = document.getElementById("playlists");

    if (!playlistsDiv) {
        return;
    }

    playlistsDiv.innerText = "Here by playlists";

    let playlists = await getPlaylists("https://api.spotify.com/v1/me/playlists?limit=50&offset=0");
    console.log(playlists);


}

async function getPlaylists(link: string, playlists: any[] = []) {
    const token = localStorage.getItem("access_token");

    if (!token) {
        return [];
    }

    const res = await fetch(link, {
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
        console.log(playlistData);
        playlists = playlists.concat(playlistData.items);

        const nextLink = playlistData.next;
        if(nextLink){
            return await getPlaylists(nextLink, playlists);
        } else {
            return playlists;
        }
    }
}
listPlaylists();