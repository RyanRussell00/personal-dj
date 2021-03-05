import axios from "axios";
import {useState} from "react";
import {SearchResultList} from "./SearchResultList";
import {LoadingAnimation} from "./LoadingAnimation";
import {handleError} from "../utilities/apiErrorHandler";
import {PATHS} from "../utilities/constants";

const NewPlaylistForm = ({seedIds, token}) => {
        const [showOptionalInputs, setShowOptionalInputs] = useState(false);
        const [danceable, setDanceable] = useState("");
        const [energy, setEnergy] = useState("");
        const [popular, setPopular] = useState("");
        const [limit, setLimit] = useState("");
        const [acoustic, setAcoustic] = useState("");
        const [vocal, setVocal] = useState("");
        const [instrumental, setInstrumental] = useState("");
        const [BPM, setBPM] = useState("");
        const [positivity, setPositivity] = useState("");
        const [listOfRecommendations, setListOfRecommendations] = useState([]);
        const [listOfIds, setListOfIds] = useState([]);
        // const [listOfNonExplicitRecommendations, setListOfNonExplicitRecommendations] = useState([]);
        // const [listOfNonExplicitIds, setListOfNonExplicitIds] = useState([]);
        const [isLoading, setIsLoading] = useState(false);
        const [playlistIsCreated, setPlaylistIsCreated] = useState(false);
        const [explicitPlaylistIsCreated, setExplicitPlaylistIsCreated] = useState(false);
        const [explicitFilter, setExplicitFilter] = useState(false);
        const [dataAsJSON, setDataAsJSON] = useState();

        // var dataAsJSON_cache = null;

        const searchForRecommendations = (event) => {
            event.preventDefault();

            setIsLoading(true);
            resetForm();

            axios
                .get(PATHS.api + "/recommendations", {
                    params: {
                        token,
                        seed_tracks: seedIds,
                        danceability: danceable / 10,
                        energy: energy / 10,
                        popular,
                        limit,
                        acousticness: acoustic,
                        speechiness: vocal,
                        instrumentalness: instrumental,
                        tempo: BPM,
                        valence: positivity,
                    },
                })
                .then((response) => {
                    displayResults(response.data.trackResult);
                    setDataAsJSON(response.data.trackResult);
                    // dataAsJSON_cache = response.data.trackResult
                })
                .catch((error) => {
                    console.error("ERROR: /api/recommendations : ", error);
                    handleError(error);
                }).finally(() => setIsLoading(false));
        };

        const resetForm = () => {
            setPlaylistIsCreated(false);
            setExplicitPlaylistIsCreated(false);
            setListOfRecommendations([]);
            setListOfIds([]);
            setExplicitFilter(false);
        }

        const savePlaylist = () => {
            setIsLoading(true);
            if (hasPlaylistSavedAlready()) {
                let confirm = window.confirm("This playlist already created do you want to create duplicate playlist?");
                if (!confirm) {
                    setIsLoading(false);
                    return;
                }
            }
            axios
                .get(PATHS.api + "/createPlaylist", {
                    params: {
                        token,
                    },
                })
                .then((response) => {
                    axios
                        .get(PATHS.api + "/addTracks", {
                            params: {
                                track_list: (listOfIds),
                                playlist_id: response.data.data,
                                token: token,
                            },
                        })
                        .then((response2) => {
                            alert("Playlist saved!");
                            if (explicitFilter) {
                                setExplicitPlaylistIsCreated(true);
                            } else {
                                setPlaylistIsCreated(true);
                            }
                        })
                        .catch((error) => {
                            // alert("Failed to save. See error below.\n", error);
                            handleError(error);
                        });
                })
                .catch((error) => {
                    handleError(error)
                }).finally(() => setIsLoading(false));
        };

        /* Check if the current list of recommendations has already been saved
        *  False = Playlist has not been saved already */
        const hasPlaylistSavedAlready = () => {
            if ((explicitFilter && !explicitPlaylistIsCreated) ||
                (!playlistIsCreated && !explicitFilter)) {
                return false;
            }
            return true;
        }

        const displayResults = (dataAsJSON, explicit_filter = false) => {
            if (!dataAsJSON || dataAsJSON === {} || dataAsJSON.length < 1) {
                setListOfRecommendations([]);
                setListOfIds([]);
                return;
            }
            setIsLoading(true);
            let tempList = [];
            let tempIds = [];
            // let tempListNonExplicit = [];
            // let tempIdsNonExplicit = [];
            for (let i = 0; i < dataAsJSON.tracks.length; i++) {
                let curr = dataAsJSON.tracks[i];
                // If explicit filter is checked, skip the explicit
                if (explicit_filter && curr.explicit) {
                    continue;
                }
                let track = {
                    id: curr.id,
                    title: curr.name,
                    imgUrl: curr.album.images[0].url,
                    artist: curr.artists[0].name,
                    explicit: curr.explicit
                };
                // update list of ids of tracks to later add to playlist
                tempIds.push(track.id);
                tempList.push(track);
            }
            setListOfRecommendations(tempList);
            setListOfIds(tempIds);
            setIsLoading(false);
        }

        // const removeExplicitFromList = (removeExplicit) => {
        //     if (removeExplicit) {
        //         for ()
        //     }
        // }

        const handleExplicitFilterChange = (event) => {
            displayResults(dataAsJSON, event.target.checked);
            setExplicitFilter(event.target.checked);
        }

        return (
            <>
                <form className="form-group" onSubmit={searchForRecommendations}>
                    <h5>Fine tune your recommendations</h5>

                    <label>
                        How <i>danceable</i> do you want the recommendations? (0 to 10)
                    </label>
                    <div className="input-group">
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="1"
                            id="danceability"
                            className="form-control col-sm-2"
                            value={danceable}
                            onChange={(e) => setDanceable(e.target.value)}
                            required
                        />
                    </div>
                    <small className="form-text text-muted">
                        0 = Funeral Music <br/>
                        10 = Mardi Gras
                    </small>
                    <br/>

                    <label>
                        How <i>H Y P E</i> do you want the recommendations? (0 to 10)
                    </label>
                    <div className="input-group">
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="1"
                            id="energy"
                            className="form-control col-sm-2"
                            value={energy}
                            onChange={(e) => setEnergy(e.target.value)}
                            required
                        />
                    </div>
                    <small className="form-text text-muted">
                        0 = Beethoven <br/>
                        10 = Downing 6 cans of Redbull in one sitting
                    </small>
                    <br/>

                    <label>
                        How <i>popular</i> do you want the recommendations? (0 to 100)
                    </label>
                    <div className="input-group">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            id="popular"
                            className="form-control col-sm-2"
                            value={popular}
                            onChange={(e) => setPopular(e.target.value)}
                            required
                        />
                    </div>

                    <small className="form-text text-muted">
                        0 = Literally never heard before <br/>
                        100 = Your grandma knows the song cause she heard it on the radio 43
                        times
                    </small>
                    <br/>

                    <label>How many songs do you want? (1 to 50)</label>
                    <div className="input-group">
                        <input
                            type="number"
                            min="1"
                            max="50"
                            step="1"
                            id="limit"
                            className="form-control col-sm-2"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-sm-12 my-5">
                        <h4>
                            <span className="text-">[OPTIONAL] </span>
                            Do you want to fine-tune with more inputs?
                        </h4>
                        <div className="">
                            <button
                                type="button"
                                className="btn btn-success m-1"
                                onClick={() => setShowOptionalInputs(true)}
                            >
                                Yes plz gimme control
                            </button>
                            <button
                                type="button"
                                className="btn btn-warning m-1 my-2"
                                onClick={() => setShowOptionalInputs(false)}
                            >
                                nah
                            </button>
                        </div>
                    </div>
                    <div style={{display: showOptionalInputs ? "block" : "none"}}>
                        <h4>
                            All the inputs below are OPTIONAL. Read the text below the input for
                            a description of what they do.
                        </h4>
                        <label className="mt-2">
                            <span className="text-muted">[OPTIONAL] </span>
                            How acoustic do you want the track? (0 to 10)
                        </label>
                        <div className="input-group">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="1"
                                id="acousticness"
                                className="form-control col-sm-2"
                                value={acoustic}
                                onChange={(e) => setAcoustic(e.target.value)}
                            />
                        </div>
                        <small className="form-text text-muted">
                            0 = 0% Confidence that track is acoustic
                            <br/>
                            10 = 100% Confidence that track is acoustic
                        </small>
                        <br/>

                        <label className="mt-2">
                            <span className="text-muted">[OPTIONAL] </span>
                            How vocal do you want the tracks? (0 to 10)
                        </label>
                        <div className="input-group">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="1"
                                id="speechiness"
                                className="form-control col-sm-2"
                                value={vocal}
                                onChange={(e) => setVocal(e.target.value)}
                            />
                        </div>
                        <small className="form-text text-muted">
                            Value less than 3 = Music and other non-speech-like tracks
                            <br/>
                            Value between 3 and 6 = Music and speech such as rap music <br/>
                            Value greater than 6 = Talk-show, audio-book, poetry
                        </small>
                        <br/>

                        <label className="mt-2">
                            <span className="text-muted">[OPTIONAL] </span>
                            How instrumental do you want the tracks? (0 to 10)
                        </label>
                        <div className="input-group">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="1"
                                id="instrumentalness"
                                className="form-control col-sm-2"
                                value={instrumental}
                                onChange={(e) => setInstrumental(e.target.value)}
                            />
                        </div>
                        <small className="form-text text-muted">
                            Under 5 = Less instrumental <br/>
                            Greater than 5 = More instrumental
                        </small>
                        <br/>

                        <label className="mt-2">
                            <span className="text-muted">[OPTIONAL] </span>
                            What BPM (beats per minute) do you want? (0 to 1000)
                        </label>
                        <div className="input-group">
                            <input
                                type="number"
                                min="0"
                                max="1000"
                                step="1"
                                id="tempo"
                                className="form-control col-sm-2"
                                value={BPM}
                                onChange={(e) => setBPM(e.target.value)}
                            />
                        </div>
                        <small className="form-text text-muted">
                            Enter BPM as a number between 0 and 1,000
                        </small>
                        <br/>

                        <label className="mt-2">
                            <span className="text-muted">[OPTIONAL] </span>
                            How much musical positiveness should the tracks have? (0 to 10)
                        </label>
                        <div className="input-group">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="1"
                                id="valence"
                                className="form-control col-sm-2"
                                value={positivity}
                                onChange={(e) => setPositivity(e.target.value)}
                            />
                        </div>
                        <small className="form-text text-muted">
                            0 = Negative (sad, depressed, angry) <br/>
                            10 = Positive (happy, cheerful, euphoric)
                        </small>
                        <br/>
                        <button
                            type="button"
                            className="btn btn-warning m-2 mb-4"
                            onClick={() => setShowOptionalInputs(false)}
                        >
                            Cancel Optional Inputs
                        </button>
                        <hr/>
                    </div>
                    <button className="btn btn-success text-white" type="submit">
                        Get Recommendations
                    </button>
                </form>
                {
                    dataAsJSON != null &&
                    (
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
                                        checked={explicitFilter}
                                        onChange={handleExplicitFilterChange}
                                    />
                                    <label className="custom-control-label mx-1">
                                        Filter explicit content
                                    </label>
                                </div>
                            </form>
                        </div>)
                }
                <div>{listOfIds.length + " tracks found"}</div>
                <LoadingAnimation show={isLoading}/>
                <div className="search-results">
                    {(!isLoading &&
                        < SearchResultList
                            searchResults={listOfRecommendations}
                            setCurrentSelected={null}
                        />)}
                </div>
            </>
        );
    }
;

export default NewPlaylistForm;
