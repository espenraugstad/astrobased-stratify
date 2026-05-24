import { use, useState, type Dispatch, type SetStateAction } from "react";
import type { Playlist, MergePhase } from "../scripts/types.ts";

interface PlaylistItemProps {
    playlist: Playlist;
    onSelection: Dispatch<SetStateAction<Playlist[]>>;
    onTarget: Dispatch<SetStateAction<Playlist | null>>;
    targetId: Playlist | null;
    mergePhase: MergePhase;
}

export default function PlaylistItem({ playlist, onSelection, onTarget, targetId, mergePhase }: PlaylistItemProps) {

    const [selected, setSelected] = useState(false);
    const [isTarget, setIsTarget] = useState(false);

    const imageUrl = playlist.images?.[0]?.url;
    const altImageUrl = `https://placehold.co/64?text=${playlist.name.slice(0, 2)}`;

    function toggleSelection() {

        // This is not the target playlist, it is selected, but we are in the targeting phase.
        if (!isTarget && selected && mergePhase === "target") {
            return;
        }

        // We are in the targeting phase
        if (mergePhase === "target") {
            console.log("Targeting");

            // If this playlist is already the target, untarget it.
            if (isTarget) {
                setIsTarget(false);
                setSelected(false);
                // Remove it from the target state in the parent component
                onTarget((prev) => null);
            } else {
                // This playlist is not the target.
                // Only allow selection of this if another playlist is not already targeted
                console.log("This is not the target")
                if (!targetId) {
                    console.log(targetId);
                    setIsTarget(true);
                    setSelected(true);
                    onTarget((prev) => playlist);
                }
            }
        }

        // If this has been selected as a target, and we have returned to selecting sources, this will not be a target anymore.
        if (mergePhase === "source") {
            setIsTarget(false);
            // Update parent state of selection
            onSelection((previousState) => {
                const isSelected = previousState.some((p) => p.id === playlist.id);

                if (isSelected) {
                    return previousState.filter((p) => p.id !== playlist.id);
                } else {
                    return [...previousState, playlist];
                }
            });
            setSelected(!selected);
        }



    }

    {/* <div className="px-2 text-4xl font-bold"><span
                        className="material-symbols-outlined rotate-90"
                        style={{fontSize: "3rem"}}

                    >
                        merge
                    </span></div> */}

    return (
        <div onClick={toggleSelection} className={`${(selected && mergePhase === "target" && !isTarget) ? "cursor-not-allowed opacity-50" : "cursor-pointer "} bg-green-200 flex my-2 items-center overflow-auto text-nowrap w-lg`}>
            {selected ?
                (!isTarget ?
                    <div className="px-2 text-4xl font-bold">&#8592;</div>
                    : <div className="px-2 text-4xl font-bold"><span
                        className="material-symbols-outlined rotate-90"
                        style={{ fontSize: "3rem" }}

                    >
                        merge
                    </span></div>)

                : <div className="w-0 h-0 m-0"></div>}

            <img src={imageUrl ? imageUrl : altImageUrl} width="64" height="64" className="mr-4 object-cover w-[64px] h-[64px]" />
            <div>
                <h2 className="text-xl font-bold">{playlist.name}</h2>
                <p>{playlist.owner.display_name}</p>
            </div>
        </div>
    )
}