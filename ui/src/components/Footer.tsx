import React from "react";

const heart_image = require("../assets/8-bit-heart.png");

const Footer = () => {
    return (
        <footer className="text-center my-5">
            <hr/>
            <p>
                Made with
                <img className="mx-1" width="20px" src={heart_image}/> by
                <a
                    href="https://github.com/RyanRussell00/personal-dj/blob/master/CONTRIBUTORS.md"
                    target="_blank"
                    className="mx-1"
                >
                    Our Contributors
                </a>
            </p>
            <p>
                This is an open source project.
                <a href="https://github.com/RyanRussell00/personal-dj" className="mx-1">
                    Contribute now!
                </a>
            </p>
            <small>Version 2.0 -- Now with extra cheese!</small>
        </footer>
    );
};

export default Footer;
