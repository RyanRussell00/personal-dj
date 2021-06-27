import React, {useEffect} from "react";
import {useForm, SubmitHandler} from "react-hook-form";
import {getTokenFromCookies, saveToken, tokenError} from "../utilities/cookieHandler";
import {useHistory} from 'react-router-dom';

type Inputs = {
    example: string,
    exampleRequired: string,
};

export const MediaSearchForm = () => {
    const {register, handleSubmit, watch, formState: {errors}} = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = data => console.log(data);
    const history = useHistory();
    const query = new URLSearchParams(window.location.search);
    const newToken = query.get("token");

    // Get user token from the URL bar
    // TODO: Maybe this should be passed back in the request's body / state instead of URL params?
    useEffect(() => {
        if (newToken) {
            saveToken(newToken);
            // Hide user token so they don't accidentally copy paste it out
            window.location.search = "";
        } else if (!getTokenFromCookies()) {
            tokenError();
            history.push("/");
        }
    }, []);

    console.log(watch("example")) // watch input value by passing the name of it

    return (
        /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* register your input into the hook by invoking the "register" function */}
            <input defaultValue="test" {...register("example")} />

            {/* include validation with required or other standard HTML validation rules */}
            <input {...register("exampleRequired", {required: true})} />
            {/* errors will return when field validation fails  */}
            {errors.exampleRequired && <span>This field is required</span>}

            <input type="submit"/>
        </form>
    );
}