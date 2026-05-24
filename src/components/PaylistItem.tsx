import { use, useState, type Dispatch, type SetStateAction } from "react";
import type { Playlist, PlaylistSelectionType } from "../scripts/types.ts";

interface PlaylistItemProps {
    playlist: Playlist;
    onSelection: Dispatch<SetStateAction<Playlist[]>>;
    selectionType: PlaylistSelectionType;
}

export default function PlaylistItem({ playlist, onSelection, selectionType }: PlaylistItemProps) {

    const [selected, setSelected] = useState(false);
    const [isTarget, setIsTarget] = useState(false);

    const imageUrl = playlist.images?.[0]?.url;
    const altImageUrl = `https://placehold.co/64?text=${playlist.name.slice(0, 2)}`;

    function toggleSelection() {
        /* if (selected && selectionType === "target") {
            return;
        } */

        if (selectionType === "target") {
            console.log("Targeting");
            setIsTarget(!isTarget);
        }
        setSelected(!selected);

        // Update parent state of
        onSelection((previousState) => {
            const isSelected = previousState.some((p) => p.id === playlist.id);

            if (isSelected) {
                return previousState.filter((p) => p.id !== playlist.id);
            } else {
                return [...previousState, playlist];
            }
        });
    }

    {/* <div className="px-2 text-4xl font-bold"><span
                        className="material-symbols-outlined rotate-90"
                        style={{fontSize: "3rem"}}

                    >
                        merge
                    </span></div> */}

    return (
        <div onClick={toggleSelection} className={`${(selected && selectionType === "target" && !isTarget) ? "cursor-not-allowed opacity-50" : "cursor-pointer "} bg-green-200 flex my-2 items-center overflow-auto text-nowrap w-lg`}>
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