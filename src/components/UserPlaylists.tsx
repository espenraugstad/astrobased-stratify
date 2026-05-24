import { useState, useEffect } from "react";
import type { Playlist, MergePhase } from "../scripts/types.ts";
import PlaylistItem from "./PaylistItem.tsx";

export default function UserPlaylists() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sourceIds, setSourceIds] = useState<Playlist[]>([]);
    const [targetId, setTargetId] = useState<Playlist | null>(null);
    const [mergePhase, setMergePhase] = useState<MergePhase>("source");
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
            return sourceIds.some((p) => p.id === playlist.id);
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

    // Different states
    if (loading) return <div><p>Loading playlists...</p></div>;
    if (error) return <div><p>Error: {error}</p></div>;
    if (playlists.length === 0) return <div><p>No playlists found.</p></div>;

    return (
        <div >
            <section className="mb-4">
                <label htmlFor="searchPlaylists" className="text-lg font-medium">Search playlists by title or owner.</label>
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} id="searchPlaylists" type="text" placeholder="Search for playlists" className="mb-2 border-1 p-2 w-full" />
                {/*                 <div>
                    <p>Selected playlists: <span>{sourceIds.length}</span></p>
                </div> */}
                {/*                 <div className="my-4">
                    <button onClick={newStep} disabled={sourceIds.length === 0} className="my-4 mr-2 w-48 h-14 text-sm text-white font-bold rounded-full bg-green-900 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-green-700 hover:cursor-pointer">Select {mergePhase === "target" ? "Source Playlists" : "Target Playlist"} </button>
                    <button onClick={toggleSelected} disabled={sourceIds.length === 0 && !showSelected} className="my-4 ml-2 w-48 h-14 text-sm text-white font-bold rounded-full bg-green-900 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-green-700 hover:cursor-pointer">Show {showSelected ? "All" : "Selected"} Playlists</button>
                </div> */}

                <section className="mt-8">
                    {mergePhase === "source" && <h2 className="text-xl font-bold">Select playlists you want to merge from</h2>}
                    {mergePhase === "target" && <h2 className="text-xl font-bold">Select the target playlist</h2>}

                    <div className="flex justify-between">
                        <p>Selected playlists: <span>{sourceIds.length}</span></p>
                        <div className="flex items-center">
                            <input onChange={toggleSelected} className="mr-1" type="checkbox" name="showSelected" id="showSelected" />
                            <label htmlFor="showSelected">Only show selected</label>
                        </div>
                    </div>

                    {mergePhase === "source" && <div className="flex justify-end">
                        <button onClick={()=>{setMergePhase("target")}} disabled={sourceIds.length === 0} className="my-4 mr-2 w-48 h-14 text-sm text-white font-bold rounded-full bg-green-900 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-green-700 hover:cursor-pointer">Select target playlist &#8594;</button>
                    </div>}
                    {mergePhase === "target" && <div className="flex justify-between">
                        <button onClick={()=>{setMergePhase("source")}} disabled={sourceIds.length === 0} className="my-4 mr-2 w-48 h-14 text-sm text-white font-bold rounded-full bg-green-900 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-green-700 hover:cursor-pointer">&#8592; Select source playlists</button>
                        <button onClick={()=>{setMergePhase("merge")}} disabled={sourceIds.length === 0} className="my-4 mr-2 w-48 h-14 text-sm text-white font-bold rounded-full bg-green-900 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-green-700 hover:cursor-pointer">Merge playlists &#8594;</button>
                    </div>}
                </section>

            </section>
            <section>
                {filteredPlaylists.map((playlist) => (
                    <PlaylistItem key={playlist.id} mergePhase={mergePhase} playlist={playlist} onSelection={setSourceIds} onTarget={setTargetId} targetId={targetId}/>
                ))}
            </section>

        </div>
    )
}