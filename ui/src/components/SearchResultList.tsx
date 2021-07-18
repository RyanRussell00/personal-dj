import {SearchResultModel} from "../models/SearchResultModel";
import React, {ChangeEvent, EventHandler, MouseEventHandler, useState} from "react";
import {mapJSONTrackSearchToModel} from "../utilities/JSONMapperUtilities";

type SearchResultListProps = {
    searchResults: Map<string, SearchResultModel>,
    setCurrentSelected: (track: SearchResultModel) => void
}

export const SearchResultList: React.FC<SearchResultListProps> = ({searchResults, setCurrentSelected}) => {
        // Keep track of selected locally to show the selected one
        const [selectedToShow, setSelectedToShow] = useState("");

        const handleSelectTrack = (trackId: string) => {
            setCurrentSelected(searchResults.get(trackId)!!); // Callback function so the parent can have access to the selected id
            setSelectedToShow(trackId); // Set the selected to show which one is highlighted
        };

        const renderResults = () => {
            let res: SearchResultModel[] = [];
            searchResults.forEach((track, key) => {
                res.push(track);
            });
            return res;
        }

        return (
            <>
                {renderResults().map((result) => {
                    return (
                        <div className="col-lg col-sm-3 m-1">
                            <div
                                className={
                                    "card shadow track my-2 d-block " +
                                    (selectedToShow == result.trackId ? "selected-track" : "")
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
    }
;
