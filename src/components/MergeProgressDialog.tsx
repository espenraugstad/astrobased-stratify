import { useState, useRef, useEffect, type Dispatch, type SetStateAction } from "react";
import type { Playlist, MergePhase } from "../scripts/types";
import { performMerge } from "../scripts/playlists/performMerge";

interface MergeProgressDialogProps {
    sources: Playlist[];
    target: Playlist | null;
    setMergePhase: Dispatch<SetStateAction<MergePhase>>;
    setSourceIds: Dispatch<SetStateAction<Playlist[]>>;
    setTargetId: Dispatch<SetStateAction<Playlist | null>>;
}

export default function MergeProgressDialog({ sources, target, setMergePhase, setSourceIds, setTargetId }: MergeProgressDialogProps) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [status, setStatus] = useState<string>("Starting merge...");
    const [mergeComplete, setMergeComplete] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        dialogRef.current?.showModal();

        async function runMerge(){
            try{
                await performMerge({sources, target, setStatus, setProgress});
                setStatus("Merge complete");
                setMergeComplete(true);
            } catch(err){
                setStatus("Error merging playlists. Please try again.");
                console.error(err);
            }
        }
        runMerge();

    }, []);

    function closeDialog() {
        setMergePhase("source");
        setSourceIds([]);
        setTargetId(null);
        dialogRef.current?.close();
    }

    return (
        <dialog ref={dialogRef} className="flex flex-col items-center min-w-1/2 m-auto backdrop:bg-black backdrop:opacity-70 p-4">
            <h2 className="text-2xl font-bold">Merging Playlists</h2>
            <p className="my-4">{status}</p>
            <progress value={progress} max={100}>{progress}</progress>
            <button className="m-4 w-48 h-14 text-sm text-white font-bold rounded-full bg-green-900 hover:bg-green-700 hover:cursor-pointer" onClick={closeDialog}>Done</button>
        </dialog>)
}