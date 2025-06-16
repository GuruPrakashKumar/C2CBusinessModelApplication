import React, { useState, useEffect } from 'react';
import { BiSolidLike } from 'react-icons/bi';

import { motion } from "framer-motion"

const cardStyle = {
    width: '650px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    margin: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
};

const cardHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
};

const profilePhotoStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    marginRight: '10px',
    marginBottom: '5px',
};

const nameStyle = {
    fontSize: '16px',
    fontWeight: 600,
};

const datePublishedStyle = {
    color: 'grey',
    fontSize: '12px',
};

const backgroundStyle = {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: -1,
    borderRadius: '8px',
};

const contentStyle = {
    background: 'rgb(235, 240, 255, 0.7)',
    borderRadius: '10px',
    padding: '16px',
};


const BlogCard = ({ blogId, title, name, blog, blogImageUrl, profilePhoto, datePublished, showReadMore, onReadMoreClick, likes, isLiked }) => {
    const [userEmail, setUserEmail] = useState(null);
    const [likeStatus, setIsLiked] = useState(isLiked);
    const [likesCount, setLikes] = useState(likes)
    const readMoreLinkStyle = {
        color: 'black',
        background: '#96c2ff',
        marginTop: '10px',
        padding: '8px 16px',
        bold: 'true',
        borderRadius: '12px',
        display: showReadMore ? 'block' : 'none',
    };

    const handleLikeClick = async ()=>{
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
            setUserEmail(storedEmail);
        }
        if(storedEmail==null){
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/blog/like-blog`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({blogId: blogId,})
            })
        }else{
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/blog/like-blog`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({blogId: blogId,email:storedEmail})
            })
        }
        
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            
            <div style={cardStyle}>
                <div style={backgroundStyle}></div>
                <div style={cardHeaderStyle}>
                    <img src={profilePhoto} alt="Profile" style={profilePhotoStyle} />
                    <div>
                        <h2 style={nameStyle}>{name}</h2>
                        <p style={datePublishedStyle}>{datePublished}</p>
                    </div>
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: 600, alignmentBaseline: 'middle', marginTop: '10px', marginBottom: '10px' }}>{title}</h1>
                <div style={contentStyle}>
                    <p>{<div dangerouslySetInnerHTML={{ __html: blog }}></div>}</p>
                </div>
                {blogImageUrl && (
                    <img src={blogImageUrl} alt="Blog" style={{ maxWidth: '50%', marginTop: '5px' }} />
                )}
                <motion.div whileTap={{ scale: 0.97 }}>
                    <button style={readMoreLinkStyle} onClick={() => onReadMoreClick()}>Read More..</button>
                </motion.div>
                <div style={{display: 'flex',alignItems: 'center',marginTop:'10px'}}>
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8, rotate: -30 }}>
                        <BiSolidLike
                            style={{ width: '24px', height: '24px', cursor: 'pointer', color: likeStatus ? 'black' : 'grey' }}
                            onClick={() => {
                                if(likeStatus){
                                    setLikes(likesCount-1);
                                }else{
                                    setLikes(likesCount+1);
                                }
                                setIsLiked(!likeStatus);
                                handleLikeClick()
                            }}
                        />

                    </motion.div>
                    <span style={{ marginLeft: '8px' }}>{likesCount} Likes</span>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
