import type { Dispatch, SetStateAction } from "react";
import type { Playlist, PlaylistTrackObject } from "../types";

interface PerformMerge {
    sources: Playlist[];
    target: Playlist | null;
    setStatus: Dispatch<SetStateAction<string>>;
    setProgress: Dispatch<SetStateAction<number>>;
}

export async function performMerge({ sources, target, setStatus, setProgress }: PerformMerge) {
    console.log(sources);
    console.log(target);
    if (!sources) {
        alert("No source found. Try again.");
        return;
    }

    if (!target) {
        alert("No target found. Try again.");
        return;
    }


    setProgress(0);
    let sourceItems: PlaylistTrackObject[] = [];
    for (const [index, playlist] of Object.entries(sources)) {
        setStatus(`Fetching tracks from source playlist ${parseInt(index) + 1} of ${sources.length}.`);
        const playlistItems = await getPlaylistItems(playlist.id, setProgress);
        sourceItems = sourceItems.concat(playlistItems);
        /* setProgress((parseInt(index) + 1) * 100 / sources.length); */
    }

    setStatus("Fetching tracks from the target playlist...");
    setProgress(0);
    const targetItems = await getPlaylistItems(target.id, setProgress);
    setProgress(100);

    setStatus("Merging sources into target.");
    setProgress(0);

    const itemsToAddToTarget = merge(sourceItems, targetItems, setProgress);
    setProgress(75);

    if (itemsToAddToTarget.size === 0) {
        setProgress(100);
        setStatus("Playlists are already merged :)");
    } else {
        await addItemsToTarget(itemsToAddToTarget, target.id, setProgress);
        setProgress(100);
        setStatus("Merge complete :D");
    }

}

async function addItemsToTarget(items: Set<string>, targetId: string, setProgress: Dispatch<SetStateAction<number>>) {
    const token = localStorage.getItem("access_token");

    if (!token) {
        throw new Error("No access token found. Please log in.");
    }

    const url = `https://api.spotify.com/v1/playlists/${targetId}/items`;

    // Since a maximum of 100 items can be added with each request, chunk the items into an array containing arrays with a maximum of 100 items each
    const itemsArray = Array.from(items);
    const itemChunks = [];
    const chunkSize = 100;

    for (let i = 0; i < itemsArray.length; i += chunkSize) {
        const chunk = itemsArray.slice(i, i + chunkSize);
        itemChunks.push(chunk);
    }

    console.log(itemChunks);

    for (const chunk of itemChunks) {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                "uris": chunk,
            })
        });

        console.log(res);
        setProgress((previous) => previous + (25 / itemChunks.length));
    }


}

function merge(sourceItems: PlaylistTrackObject[], targetItems: PlaylistTrackObject[], setProgress: Dispatch<SetStateAction<number>>) {

    console.log(sourceItems);

    const sourcesSet = new Set(sourceItems.map((track) => track.item.uri));
    setProgress(25);
    const targetSet = new Set(targetItems.map((track) => track.item.uri));
    setProgress(50);
    const difference = sourcesSet.difference(targetSet);
    /* console.log("Source tracks");
    console.log(sourcesSet);
    console.log("Target tracks");
    console.log(targetSet);
    console.log("Tracks to be added");
    console.log(difference); */
    return difference;
}



async function getPlaylistItems(playlistId: string, setProgress: Dispatch<SetStateAction<number>>, url: string = "", items: PlaylistTrackObject[] = []) {
    const token = localStorage.getItem("access_token");

    if (!token) {
        throw new Error("No access token found. Please log in.");
    }

    if (url === "") {
        url = `https://api.spotify.com/v1/playlists/${playlistId}/items`;
    }

    const res = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (res.status !== 200) {
        throw new Error(`Failed to fetch playlists: ${res.statusText}`);
        console.error(res);
    } else {
        const data = await res.json();
        items = items.concat(data.items);
        console.log("Fetching playlist items");
        console.log(data);
        setProgress((prev) => prev + (100 / (Math.ceil(data.total / 100))));

        const nextLink = data.next;
        if (nextLink) {
            return await getPlaylistItems(playlistId, setProgress, nextLink, items);
        } else {
            return items;
        }
    }


}