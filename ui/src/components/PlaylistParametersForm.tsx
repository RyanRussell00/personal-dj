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
import {PlaylistParametersModel} from "../models/PlaylistParametersModel";

type PlaylistParametersFormProps = {
    setParameters: (params: PlaylistParametersModel) => void
}

export const PlaylistParametersForm: React.FC<PlaylistParametersFormProps> = ({setParameters}) => {
    const {register, handleSubmit, watch, reset} = useForm<PlaylistParametersModel>();

    const params = useRef<PlaylistParametersModel>({
        acoustic: -1,
        BPM: -1,
        danceable: -1,
        hype: -1,
        instrumental: -1,
        numOfSongs: -1,
        popular: -1,
        positiveness: -1,
        vocal: -1
    });

    params.current = {
        acoustic: watch("acoustic"),
        BPM: watch("BPM"),
        danceable: watch("danceable"),
        hype: watch("hype"),
        instrumental: watch("instrumental"),
        numOfSongs: watch("numOfSongs"),
        popular: watch("popular"),
        positiveness: watch("positiveness"),
        vocal: watch("vocal")
    }

    const onSubmit = () => {
        setParameters(params.current);
    }

    const clearAllParameters = () => {
        reset();
    }

    return (
        /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
        <form onSubmit={handleSubmit(onSubmit)} className="container">

            <hr/>

            <h1>Step 2: Fine tune your playlist</h1>
            <p>All inputs below are <b>OPTIONAL.</b> <br/>
                Leave blank to not set.</p>

            <a onClick={clearAllParameters} className={"btn btn-danger"}>Reset All Parameters</a>

            <div className={"row row-cols-2 g-2 g-lg-3"}>

                <div className={"col"}>
                    <label>How acoustic do you want the tracks? (0 to 10)</label>
                    <input {...register("acoustic")}
                           placeholder={"Acousticness"}
                           type={"number"}
                           min={0} max={10} step={1}
                           className={"form-control mb-3"}
                    />

                    <label>What BPM (beats per minute) do you want? (0 to 1000)</label>
                    <input {...register("BPM")}
                           placeholder={"Beats Per Minute (BPM)"}
                           type={"number"}
                           min={0} max={1000} step={1}
                           className={"form-control mb-3"}
                    />

                    <label>How danceable do you want the tracks? (0 to 10)</label>
                    <input {...register("danceable")}
                           placeholder={"Dance yo butt off"}
                           className={"form-control mb-3"}
                    />

                    <label>How positive (emotionally) do you want the tracks? (0 to 10)</label>
                    <input {...register("positiveness")}
                           placeholder={"Make me feel good"}
                           type={"number"}
                           min={0} max={10} step={1}
                           className={"form-control mb-3"}
                    />
                </div>

                <div className={"col"}>
                    <label>How Hype do you want the tracks? (0 to 10)</label>
                    <input {...register("hype")}
                           placeholder={"H Y P E"}
                           type={"number"}
                           min={0} max={10} step={1}
                           className={"form-control mb-3"}
                    />

                    <label>How Instrumental do you want the tracks? (0 to 10)</label>
                    <input {...register("instrumental")}
                           placeholder={"Less talk, more music"}
                           type={"number"}
                           min={0} max={10} step={1}
                           className={"form-control mb-3"}
                    />

                    <label>How popular do you want the tracks? (0 to 100)</label>
                    <input {...register("popular")}
                           placeholder={"Mo' popular"}
                           className={"form-control mb-3"}
                    />

                    <label>How vocal do you want the tracks? (0 to 10)</label>
                    <input {...register("vocal")}
                           placeholder={"More talk, less music"}
                           type={"number"}
                           min={0} max={10} step={1}
                           className={"form-control mb-3"}
                    />
                </div>

            </div>
            <br/>

            <div className={""}>
                <label><b>(Required)</b> How many songs do you want? (1 to 50)</label>
                <br/>
                <input {...register("numOfSongs")}
                       placeholder={"# of songs"}
                       type={"number"}
                       min={1} max={50} step={1}
                       className={"p-2"}
                       required
                />
            </div>
            <button className="my-3 px-5 btn btn-success" type="submit">
                Create Playlist
            </button>


        </form>
    );
}