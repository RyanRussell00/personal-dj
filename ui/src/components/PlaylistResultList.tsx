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
    selectedTrack: SearchResultModel,
    parameters: PlaylistParametersModel
}

export const PlaylistResultList: React.FC<PlaylistResultListProps> = ({selectedTrack, parameters}) => {

    const explicitResults = useRef<PlaylistTrackModel[]>([]);
    const nonExplicitResults = useRef<PlaylistTrackModel[]>([]);
    const [currentList, setCurrentList] = useState<PlaylistTrackModel[]>([]);
    const explicitChecked = useRef(false);
    const explicitCreated = useRef(false);
    const nonExplicitCreated = useRef(false);

    const [loading, setLoading] = useState(false);

    // Load results
    useEffect(() => {
        setLoading(true);
        explicitChecked.current = false;
        explicitCreated.current = false;
        nonExplicitCreated.current = false;

        axios
            .get(PATHS.api + "/recommendations", {
                params: {
                    token: getTokenFromCookies(),
                    seed_tracks: selectedTrack.trackId,
                    limit: parameters.numOfSongs,
                    danceability: parameters.danceable / 10,
                    energy: parameters.hype / 10,
                    popular: parameters.popular,
                    acousticness: parameters.acoustic,
                    speechiness: parameters.vocal,
                    instrumentalness: parameters.instrumental,
                    tempo: parameters.BPM,
                    valence: parameters.positiveness,
                },
            }).then((resp) => {
            [explicitResults.current, nonExplicitResults.current] = mapJSONRecommendedTracksToModel(resp);
            setCurrentList(explicitResults.current);
        })
            .catch((err) => handleError(err))
            .finally(() => setLoading(false));
    }, [parameters]);

    /* Check if the current list of recommendations has already been saved
     *  False = Playlist has not been saved already */
    const hasPlaylistSavedAlready = () => {
        if (explicitChecked.current && explicitCreated.current) {
            return true;
        } else if (!explicitChecked.current && nonExplicitCreated.current) {
            return true;
        }
        return false;
    }

    const savePlaylist = () => {
        setLoading(true);
        if (hasPlaylistSavedAlready()) {
            let confirm = window.confirm("This playlist already created do you want to create duplicate playlist?");
            if (!confirm) {
                setLoading(false);
                return;
            }
        }
        axios
            .get(PATHS.api + "/createPlaylist", {
                params: {
                    token: getTokenFromCookies(),
                    seed_track: selectedTrack,
                    playlist_params: parameters
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
                        if (explicitChecked.current) {
                            explicitCreated.current = true;
                        } else {
                            nonExplicitCreated.current = true;
                        }
                    })
                    .catch((error) => {
                        handleError(error);
                    });
            })
            .catch((error) => {
                handleError(error)
            }).finally(() => setLoading(false));
    };

    const handleExplicitChange = (event: ChangeEvent<HTMLInputElement>) => {
        explicitChecked.current = !explicitChecked.current;
        if (event.target.checked) {
            setCurrentList(nonExplicitResults.current);
        } else {
            setCurrentList(explicitResults.current);
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
                            checked={explicitChecked.current}
                            onChange={handleExplicitChange}
                        />
                        <label className="custom-control-label mx-1">
                            Remove Explicit Tracks
                        </label>
                    </div>
                </form>
            </div>
            {!loading &&
            <div className="search-results">
                <h2>{currentList.length} tracks found</h2>
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
                                    <br/>
                                    <i>{track.explicit ? "Explicit" : "Non-Explicit"}</i>
                                </p>
                            </div>
                        </div>)
                    })
                }
            </div>
            }
            <div className={"text-center"}>
                <button
                    className="btn btn-success text-white my-3 p-4"
                    onClick={savePlaylist}
                >
                    Save as a Playlist
                </button>
            </div>
        </>
    );
}