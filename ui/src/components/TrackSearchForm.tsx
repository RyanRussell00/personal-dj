import React, {useEffect, useRef, useState} from "react";
import {useForm, SubmitHandler} from "react-hook-form";
import {getTokenFromCookies, saveToken, tokenError} from "../utilities/cookieHandler";
import {useHistory} from 'react-router-dom';
import {SearchResultList} from "./SearchResultList";
import {SearchResultModel} from "../models/SearchResultModel";
import axios from "axios";
import {PATHS} from "../utilities/constants";
import {mapJSONTrackSearchToModel} from "../utilities/JSONMapperUtilities";
import {handleError} from "../utilities/apiErrorHandler";
import {LoadingAnimation} from "../utilities/LoadingAnimation";

type TrackSearchFormInputs = {
    trackName: string
};

type TrackSearchFormProps = {
    setSelected: (trackId: string) => void
}

export const TrackSearchForm: React.FC<TrackSearchFormProps> = ({setSelected}) => {
    const {register, handleSubmit, watch, formState: {errors}} = useForm<TrackSearchFormInputs>();

    const [results, setResults] = useState<SearchResultModel[]>([]);
    // Set offset to -1 so we can track when the page is first loaded, so we don't show "No tracks found" on initial load
    // Offset is overridden to 0 after search is pressed
    const offset = useRef(-1);
    const [loading, setLoading] = useState(false);

    let trackSearchQuery = watch("trackName") // watch input value by passing the name of it

    const getSearchResults = () => {
        setLoading(true);
        axios
            .get(PATHS.api + "/trackSearch", {
                params: {
                    track_value: trackSearchQuery,
                    searchOffset: offset.current,
                    token: getTokenFromCookies(),
                },
            })
            .then((response) => {
                setResults(mapJSONTrackSearchToModel(response));
                // loadSearchResults(response.data.trackResult.tracks.items);
            }).catch((err) => {
            handleError(err);
        }).finally(() => setLoading(false));
    }

    const loadLessResults = () => {
        // Prevents offset from going negative
        offset.current = (Math.max(0, offset.current - 5));
        getSearchResults();
    };

    const loadMoreResults = () => {
        offset.current = offset.current + 5;
        getSearchResults();
    };

    return (
        /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
        <form onSubmit={handleSubmit(() => {
            // Reset offset to 0 when searching for a new title
            offset.current = 0;
            getSearchResults();
        })} className="container">

            <h1>Step 1: Pick a seed song</h1>
            {/* include validation with required or other standard HTML validation rules */}
            <input {...register("trackName")}
                   placeholder={"Search for a track"}
                   className={"w-50"}
                   required/>
            <br/>
            <button className="my-2 px-5 btn btn-success" type="submit">
                Search
            </button>

            <LoadingAnimation show={loading}/>

            <div className="search-results p-2">
                <SearchResultList searchResults={results} setCurrentSelected={setSelected}/>
            </div>

            {
                results.length > 0 ?
                    (<div className="my-4">
                        <ul className="list-inline">
                            <li className="list-inline-item" onClick={loadLessResults}>
                                <a className="btn btn-success text-white"> &#60; Last 5 </a>
                            </li>
                            <li className="list-inline-item" onClick={loadMoreResults}>
                                <a className="btn btn-success text-white">Next 5 &#62;</a>
                            </li>
                        </ul>
                    </div>) : ((offset.current >= 0 && !loading) ?
                    <h3 className="my-3 text-white">No tracks found</h3> : <></>)
            }
        </form>
    );
}