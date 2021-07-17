import {SearchResultModel} from "../models/SearchResultModel";
import {useEffect, useRef, useState} from "react";
import {PlaylistParametersModel} from "../models/PlaylistParametersModel";
import {TrackSearchForm} from "./TrackSearchForm";
import {getTokenFromCookies, saveToken, tokenError} from "../utilities/cookieHandler";
import {useHistory} from "react-router-dom";
import {PlaylistParametersForm} from "./PlaylistParametersForm";
import {PlaylistResultList} from "./PlaylistResultList";

export const Dashboard = () => {
    const [selectedTrackId, setSelectedTrackId] = useState("");
    const [playlistParams, setPlaylistParams] = useState<PlaylistParametersModel>();

    const history = useHistory();
    const query = new URLSearchParams(window.location.search);
    const authToken = query.get("token");

    // Get user token from the URL bar
    // TODO: Maybe this should be passed back in the request's body / state instead of URL params?
    useEffect(() => {
        if (authToken) {
            saveToken(authToken);
            // Hide user token so they don't accidentally copy paste it out
            window.location.search = "";
        } else if (!getTokenFromCookies()) {
            tokenError();
            history.push("/");
        }
    }, []);

    const setParameters = (params: PlaylistParametersModel) => {
        console.log(params);
        setPlaylistParams(params);
    }

    return (
        <div className={"container text-center my-3"}>
            <TrackSearchForm setSelected={setSelectedTrackId}/>
            {selectedTrackId.length > 0 ?
                <PlaylistParametersForm setParameters={setParameters}/> : <></>
            }
            {
                playlistParams ?
                    <PlaylistResultList parameters={playlistParams} selected={selectedTrackId}/> :
                    <></>
            }
        </div>
    )
}