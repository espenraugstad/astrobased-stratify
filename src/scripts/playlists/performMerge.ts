import type { Dispatch, SetStateAction } from "react";
import type { Playlist } from "../types";

interface PerformMerge{
    sources: Playlist[];
    target: Playlist | null;
    setStatus: Dispatch<SetStateAction<string>>;
    setProgress: Dispatch<SetStateAction<number>>;
}

export async function performMerge({sources, target, setStatus, setProgress}: PerformMerge){
    console.log(sources);

}