import loader from "../assets/loader.svg"
export const LoadingAnimation = ({show}) => {
    return (
        <>
            {show ? <img src={loader} className="m-5"/> : <></>}
        </>
    )
}