import {SearchResultModel} from "../models/SearchResultModel";
import {useEffect, useState} from "react";
import {PlaylistParametersModel} from "../models/PlaylistParametersModel";
import {TrackSearchForm} from "./TrackSearchForm";
import {getTokenFromCookies, saveToken, tokenError} from "../utilities/cookieHandler";
import {useHistory} from "react-router-dom";
import {PlaylistParametersForm} from "./PlaylistParametersForm";
import {PlaylistResultList} from "./PlaylistResultList";
import logo from "../assets/personal_dj_logo.png";

export const Dashboard = () => {
    const [selectedTrack, setSelectedTrack] = useState<SearchResultModel>();
    const [playlistParams, setPlaylistParams] = useState<PlaylistParametersModel>();

    const history = useHistory();
    const query = new URLSearchParams(window.location.search);
    const authToken = query.get("token");

    // Get user token from the URL bar
    useEffect(() => {
        if (authToken) {
            saveToken(authToken);
            // Hide user token so they don't accidentally copy paste it out
            window.location.search = "";
        } else if (!getTokenFromCookies()) {
            tokenError();
            history.push("/");
        }
    });

    const setParameters = (params: PlaylistParametersModel) => {
        setPlaylistParams(params);
    }

    return (
        <div className={"container text-center my-3"}>
            <img src={logo} className={"img-fluid col-lg-2 col-1"}/>
            <hr/>
            <TrackSearchForm setSelected={setSelectedTrack}/>
            {selectedTrack ?
                <PlaylistParametersForm setParameters={setParameters}/> : <></>
            }
            {
                selectedTrack && playlistParams ?
                    <PlaylistResultList parameters={playlistParams}
                                        selectedTrack={selectedTrack}/> :
                    <></>
            }
        </div>
    )
}