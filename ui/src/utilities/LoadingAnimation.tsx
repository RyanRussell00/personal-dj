import React from "react";

const loader = require("../assets/loader.svg");

type LoadingAnimationProps = {
    show: boolean
}
// TODO: Fix loading animation cause its not actually showing it
export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({show}) => {
    return (
        <>
            {show ? <img src={loader} className="m-5"/> : <></>}
        </>
    )
}