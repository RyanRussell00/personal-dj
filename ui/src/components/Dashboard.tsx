import {SearchResultModel} from "../models/SearchResultModel";
import {useEffect, useRef} from "react";
import {PlaylistParametersModel} from "../models/PlaylistParametersModel";
import {TrackSearchForm} from "./TrackSearchForm";
import {getTokenFromCookies, saveToken, tokenError} from "../utilities/cookieHandler";
import {useHistory} from "react-router-dom";

export const Dashboard = () => {
    const selectedTrackId = useRef("");
    const playlistParameters = useRef<PlaylistParametersModel>();

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

    const setSelectedTrackId = (trackId: string) => {
        selectedTrackId.current = trackId;
    }

    return (
        <TrackSearchForm setSelected={setSelectedTrackId}/>
        //    <PlaylistParametersForm/>
        //    <PlaylistResults />
    )
}