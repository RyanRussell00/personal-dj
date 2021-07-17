import React from "react";

import loader from "../assets/loader.svg";

type LoadingAnimationProps = {
    show: boolean
}
export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({show}) => {
    return (
        <>
            {show ? <img src={loader} className="m-5"/> : <></>}
        </>
    )
}