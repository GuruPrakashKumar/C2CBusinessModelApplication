import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BlogCard from './BlogCard';
import Lottie from 'lottie-react';
import animationData from '../animations/animation_ln2thlrd.json';
import loadingAnim from '../animations/individualBlogAnim.json';
import Layout from '../shop/layout';
const IndividualBlog = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        async function fetchBlog() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/blog/get/${slug}`,{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({email: localStorage.getItem('userEmail')})
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch the blog');
                }
                const data = await response.json();
                setBlog(data);
            } catch (error) {
                console.error('Error fetching the blog:', error);
            }
        }

        fetchBlog();
    }, [slug]);

    return (
        <div
            className="items-center"
            style={{ minHeight: '100vh', background: 'transparent', position: 'relative', marginTop: '100px' }}>
            <div
                className="lottie-animation"
                style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}>
                <Lottie animationData={animationData} />
            </div>
            {blog ? (
                <BlogCard
                    blogId={blog._id}
                    title={blog.title}
                    name={blog.name}
                    blog={blog.blog}
                    blogImageUrl={blog.blogImageUrl}
                    profilePhoto={blog.profilePhotoUrl}
                    datePublished={blog.datePublished}
                    likes={blog.likes}
                    isLiked={blog.isLiked}
                />
            ) : (
              <div style={{display:'flex',alignItems: 'center', justifyContent: 'center' }}>
                <Lottie style={{ width: '30%', height: '30%' }} animationData={loadingAnim} />

              </div>
            )}
        </div>
    );
};

const IndividualBlogPage = (props)=>{
    return (
        <Layout children={<IndividualBlog/>}/>
    )
  }
  

export default IndividualBlogPage;
