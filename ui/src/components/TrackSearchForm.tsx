import React, {useEffect, useState} from "react";
import {useForm, SubmitHandler} from "react-hook-form";
import {getTokenFromCookies, saveToken, tokenError} from "../utilities/cookieHandler";
import {useHistory} from 'react-router-dom';
import {SearchResultList} from "./SearchResultList";
import {SearchResultModel} from "../models/SearchResultModel";
import axios from "axios";
import {PATHS} from "../utilities/constants";
import {mapJSONTrackSearchToModel} from "../utilities/JSONToModelMappers";
import {handleError} from "../utilities/apiErrorHandler";

type TrackSearchFormInputs = {
    trackName: string
};

type TrackSearchFormProps = {
    setSelected: (trackId: string) => void
}

export const TrackSearchForm: React.FC<TrackSearchFormProps> = ({setSelected}) => {
    const {register, handleSubmit, watch, formState: {errors}} = useForm<TrackSearchFormInputs>();

    const [results, setResults] = useState<SearchResultModel[]>([]);
    const offset = 0;

    let trackSearchQuery = watch("trackName") // watch input value by passing the name of it

    const getSearchResults = () => {
        axios
            .get(PATHS.api + "/trackSearch", {
                params: {
                    track_value: trackSearchQuery,
                    searchOffset: offset,
                    token: getTokenFromCookies(),
                },
            })
            .then((response) => {
                setResults(mapJSONTrackSearchToModel(response));
                // loadSearchResults(response.data.trackResult.tracks.items);
            }).catch((err) => {
            handleError(err);
        });
    }

    return (
        /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
        <form onSubmit={handleSubmit(getSearchResults)} className="container">

            {/* include validation with required or other standard HTML validation rules */}
            <input {...register("trackName", {required: true})} placeholder={"Search for a track"}/>
            {/* errors will return when field validation fails  */}
            {errors.trackName && <span>This field is required</span>}

            <SearchResultList searchResults={results} setCurrentSelected={setSelected}/>

            <input type="submit"/>
        </form>
    );
}