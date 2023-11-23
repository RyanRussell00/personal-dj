import React from "react";
import { PATHS } from "../utilities/constants";
import axios from "axios";
import logo from "../assets/personal_dj_logo.png";

const Home = () => {
    return (
        <section>
            <div className="container w-100">
                <div className="my-5 justify-content-center text-center">
                    <div className="text-center">
                        <img src={logo} className="col-1"
                            alt={"Personal DJ Logo of a green music element in a circle"} />
                        <h1 className="">Personal DJ</h1>
                    </div>
                    <p>
                        We use Spotify's secure login to connect to your account. We never
                        see your email or password, nor do we care to. We just want to find
                        you some good music.
                    </p>
                    <button
                        onClick={login}
                        type="button"
                        className="btn btn-primary login-btn col-sm-12 col-lg-6"
                    >
                        Login with Spotify
                    </button>
                </div>
            </div>
        </section>
    );

    function login() {
        axios.get(PATHS.api + "/login").then(r => {
            window.location.href = r.data;
        })
    }
};

export default Home;
