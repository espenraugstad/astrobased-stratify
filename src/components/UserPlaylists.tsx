import { useState, useEffect } from "react";
import type { Playlist, PlaylistSelectionType } from "../scripts/types.ts";
import PlaylistItem from "./PaylistItem.tsx";

export default function UserPlaylists() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlaylists, setSelectedPlaylists] = useState<Playlist[]>([]);
    const [selectionType, setSelectionType] = useState<PlaylistSelectionType>("source");
    const [showSelected, setShowSelected] = useState(false);

    useEffect(() => {
        async function fetchAllPlaylists(link: string, playlists: Playlist[] = []): Promise<Playlist[]> {
            const token = localStorage.getItem("access_token");

            if (!token) {
                throw new Error("No access token found. Please log in.");
            }

            const res = await fetch(link, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (res.status != 200) {
                throw new Error(`Failed to fetch playlists: ${res.statusText}`);
            } else {

                const playlistData = await res.json();
                playlists = playlists.concat(playlistData.items);

                const nextLink = playlistData.next;
                if (nextLink) {
                    return await fetchAllPlaylists(nextLink, playlists);
                } else {
                    return playlists;
                }
            }
        };

        async function loadPlaylists() {
            try {
                setLoading(true);
                const allPlaylists = await fetchAllPlaylists("https://api.spotify.com/v1/me/playlists?limit=50&offset=0")
                setPlaylists(allPlaylists);
            } catch (err: any) {
                console.error("Unable to fetch user playlists:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadPlaylists();
    }, []);

    const filteredPlaylists = playlists.filter((playlist) => {
        if (showSelected) {
            return selectedPlaylists.some((p) => p.id === playlist.id);
        } else {
            const query = searchQuery.toLowerCase();

            const matchesTitle = playlist.name?.toLowerCase().includes(query) || false;
            const matchesOwner = playlist.owner?.display_name?.toLowerCase().includes(query) || false;

            return matchesTitle || matchesOwner;
        }

    });

    function toggleSelected() {
        setShowSelected(!showSelected);
    }

    // Function to move between selecting source or target or merging
    function newStep(){
        if(selectionType === "source"){
            setSelectionType("target");
        }
    }

    // Different states
    if (loading) return <div><p>Loading playlists...</p></div>;
    if (error) return <div><p>Error: {error}</p></div>;
    if (playlists.length === 0) return <div><p>No playlists found.</p></div>;

    return (
        <div >
            <section className="mb-4">
                <label htmlFor="searchPlaylists" className="text-lg font-medium">Search playlists by title or owner.</label>
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} id="searchPlaylists" type="text" placeholder="Search for playlists" className="mb-2 border-1 p-2 w-full" />
                <div>
                    <p>Selected playlists: <span>{selectedPlaylists.length}</span></p>
                </div>
                <div className="my-4">
                    <button onClick={newStep} disabled={selectedPlaylists.length === 0} className="my-4 mr-2 w-48 h-14 text-sm text-white font-bold rounded-full bg-green-900 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-green-700 hover:cursor-pointer">Select {selectionType === "target" ? "Source Playlists" : "Target Playlist"} </button>
                    <button onClick={toggleSelected} disabled={selectedPlaylists.length === 0 && !showSelected} className="my-4 ml-2 w-48 h-14 text-sm text-white font-bold rounded-full bg-green-900 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-green-700 hover:cursor-pointer">Show {showSelected ? "All" : "Selected"} Playlists</button>
                </div>
            </section>
            <section>
                {filteredPlaylists.map((playlist) => (
                    <PlaylistItem key={playlist.id} selectionType={selectionType} playlist={playlist} onSelection={setSelectedPlaylists} />
                ))}
            </section>

        </div>
    )
}