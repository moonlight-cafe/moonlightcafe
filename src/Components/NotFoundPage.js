// Components/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';
import _Config from '../Config';

const Config = new _Config();
const notfoundimg = Config.notfoundimg;

const NotFoundPage = () => {
        return (
                <div className="notfound-wrapper">
                        <div className="notfound-box">
                                <div className='notfoundiimg'>
                                        <img
                                                src={notfoundimg}
                                                alt="404 Not Found"
                                                className="notfound-image"
                                        />
                                </div>
                                <div className='notfoundtext'>

                                        <h2 className="notfound-heading">Oops! Page Not Found</h2>
                                        <p className="notfound-text">
                                                The page you’re looking for might have been removed, renamed, or it never existed.
                                        </p>
                                        <Link to="/" className="notfound-home-btn">
                                                ⬅ Back to Home
                                        </Link>
                                </div>
                        </div>
                </div>
        );
};

export default NotFoundPage;
