import {SearchResultModel} from "../models/SearchResultModel";
import React, {ChangeEvent, EventHandler, MouseEventHandler, useState} from "react";
import {mapJSONTrackSearchToModel} from "../utilities/JSONToModelMappers";

type SearchResultListProps = {
    searchResults: SearchResultModel[],
    setCurrentSelected: (trackId: string) => void
}

export const SearchResultList: React.FC<SearchResultListProps> = ({searchResults, setCurrentSelected}) => {
    // Keep track of selected locally to show the selected one
    const [selected, setSelected] = useState("");

    const handleSelectTrack = (trackId: string) => {
        setCurrentSelected(trackId); // Callback function so the parent can have access to the selected id
        setSelected(trackId); // Set the selected to show which one is highlighted
    };

    return (
        <>
            {
                searchResults.map((result) => {
                    return (
                        // Use i for tracking which index the result is at
                        <div className="col-lg col-sm-3 m-1">
                            <div
                                className={
                                    "card shadow track my-2 d-block " +
                                    (selected == result.trackId ? "selected-track" : "")
                                }
                                id={result.trackId} onClick={() => handleSelectTrack(result.trackId)}
                            >
                                <img className="card-img-top" src={result.imgUrl}/>
                                <p className="card-title py-2">
                                    {result.title}
                                    <br/>
                                    <i>by {result.artistName}</i>
                                </p>
                            </div>
                        </div>

                    );
                })}
        </>
    );
};
