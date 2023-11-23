import React from "react";

import heart_image from "../assets/8-bit-heart.png";

const Footer = () => {
    return (
        <footer className="text-center my-5">
            <hr />
            <p>
                Made with
                <img className="mx-1" width="20px" src={heart_image} alt={"8 bit heart logo"} /> by
                <a
                    href="https://github.com/RyanRussell00/personal-dj/blob/master/CONTRIBUTORS.md"
                    target="_blank"
                    rel={"noreferrer"}
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
            <small>Support this project by <a href="https://www.buymeacoffee.com/ryandrinkscoffee" target="_blank">buying me a coffe!</a></small>
        </footer>
    );
};

export default Footer;
