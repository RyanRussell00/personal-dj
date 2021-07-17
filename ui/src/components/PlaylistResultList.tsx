import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import {useForm, SubmitHandler} from "react-hook-form";
import {getTokenFromCookies, saveToken, tokenError} from "../utilities/cookieHandler";
import {useHistory} from 'react-router-dom';
import {SearchResultList} from "./SearchResultList";
import {SearchResultModel} from "../models/SearchResultModel";
import axios, {AxiosResponse} from "axios";
import {PATHS} from "../utilities/constants";
import {
    idsFromTracks,
    mapJSONRecommendedTracksToModel,
    mapJSONTrackSearchToModel
} from "../utilities/JSONMapperUtilities";
import {handleError} from "../utilities/apiErrorHandler";
import {LoadingAnimation} from "../utilities/LoadingAnimation";
import {PlaylistParametersModel} from "../models/PlaylistParametersModel";
import {PlaylistTrackModel} from "../models/PlaylistTrackModel";

type PlaylistResultListProps = {
    selectedTrackId: string,
    parameters: PlaylistParametersModel
}

export const PlaylistResultList: React.FC<PlaylistResultListProps> = ({selectedTrackId, parameters}) => {

    let explicitResults: PlaylistTrackModel[] = [];
    let nonExplicitResults: PlaylistTrackModel[] = [];
    const [currentList, setCurrentList] = useState<PlaylistTrackModel[]>([]);

    const [loading, setLoading] = useState(false);

    // Load results
    useEffect(() => {
        setLoading(true);
        axios
            .get(PATHS.api + "/recommendations", {
                params: {
                    token: getTokenFromCookies(),
                    seed_tracks: selectedTrackId,
                    limit: parameters.numOfSongs
                    // danceability: danceable / 10,
                    // energy: energy / 10,
                    // popular,
                    // limit,
                    // acousticness: acoustic,
                    // speechiness: vocal,
                    // instrumentalness: instrumental,
                    // tempo: BPM,
                    // valence: positivity,
                },
            }).then((resp) => {
            [explicitResults, nonExplicitResults] = mapJSONRecommendedTracksToModel(resp);
            setCurrentList(explicitResults);
        })
            .catch((err) => handleError(err))
            .finally(() => setLoading(false));
    }, [parameters]);

    const savePlaylist = () => {
        setLoading(true);
        // TODO: Duplicate saves
        // if (hasPlaylistSavedAlready()) {
        //     let confirm = window.confirm("This playlist already created do you want to create duplicate playlist?");
        //     if (!confirm) {
        //         setIsLoading(false);
        //         return;
        //     }
        // }
        axios
            .get(PATHS.api + "/createPlaylist", {
                params: {
                    token: getTokenFromCookies(),
                },
            })
            .then((response) => {
                axios
                    .get(PATHS.api + "/addTracks", {
                        params: {
                            track_list: idsFromTracks(currentList),
                            playlist_id: response.data.data,
                            token: getTokenFromCookies(),
                        },
                    })
                    .then((response2) => {
                        alert("Playlist saved!");
                        // TODO
                        // if (explicitFilter) {
                        //     setExplicitPlaylistIsCreated(true);
                        // } else {
                        //     setPlaylistIsCreated(true);
                        // }
                    })
                    .catch((error) => {
                        // alert("Failed to save. See error below.\n", error);
                        handleError(error);
                    });
            })
            .catch((error) => {
                handleError(error)
            }).finally(() => setLoading(false));
    };

    const handleExplicitChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setCurrentList(nonExplicitResults);
        } else {
            setCurrentList(explicitResults);
        }
    }

    return (
        <>
            <LoadingAnimation show={loading}/>
            <div>
                <button
                    className="btn btn-success text-white my-3 p-4"
                    onClick={savePlaylist}
                >
                    Save as a Playlist
                </button>
                <form>
                    <div className="custom-control custom-checkbox mb-3">
                        <input
                            type="checkbox"
                            className="custom-control-input"
                            // checked={explicitFilter}
                            onChange={handleExplicitChange}
                        />
                        <label className="custom-control-label mx-1">
                            Filter explicit content
                        </label>
                    </div>
                </form>
            </div>
            {!loading &&
            <div className="search-results">
                {
                    currentList.map((track) => {
                        return (<div className="col-lg col-sm-3 m-1">
                            <div
                                className={"card shadow track my-2 d-block"}
                            >
                                <img className="card-img-top" src={track.imgUrl}/>
                                <p className="card-title py-2">
                                    {track.title}
                                    <br/>
                                    <i>by {track.artistName}</i>
                                    {track.explicit ? "Explicit" : "Non-Explicit"}
                                </p>
                            </div>
                        </div>)
                    })
                }
            </div>
            }
        </>
    );
}