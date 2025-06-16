import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BlogCard from './BlogCard';
import Lottie from 'lottie-react';
import animationData from '../animations/animation_ln2thlrd.json';
import loadingAnim from '../animations/allBlogAnim.json';
import { motion } from "framer-motion"
import Layout from '../shop/layout';
import { useHistory } from "react-router-dom";
const MAX_PREVIEW_LENGTH = 200;

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loadingBlogs, setLoadingBlogs] = useState(true);
    // const navigate = useNavigate();
    const history = useHistory();


    useEffect(() => {
        async function fetchBlogs() {
            console.log("fetching blogs")
            try {
                const email = localStorage.getItem('userEmail');
                var response;
                if(email==null){
                    response = await fetch(`${process.env.REACT_APP_API_URL}/api/blog/get-all-blogs`,{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        
                    });
                    
                }else{
                    response = await fetch(`${process.env.REACT_APP_API_URL}/api/blog/get-all-blogs`,{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body:JSON.stringify({ email })
                        
                    });

                }

                if (!response.ok) {
                    throw new Error('Failed to fetch blogs');
                }
                const data = await response.json();
                setBlogs(data.map(blog => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(blog.blog, 'text/html');
                    const textContent = doc.body.textContent || '';
                    const preview = `${textContent.slice(0, MAX_PREVIEW_LENGTH)}....`;
                    const showReadMore = textContent.length > MAX_PREVIEW_LENGTH;
                    return {
                        ...blog,
                        preview,
                        showReadMore,
                    };
                }));
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setLoadingBlogs(false); 
            }
        }

        fetchBlogs();
    }, []);

    const handleBlogCardClick = (slug) => {
        history.push(`blogs/get/${slug}`)
        // navigate(`/get/${slug}`);
    };

    return (
        <div
            className="items-center"
            style={{ minHeight: '100vh', background: 'transparent', position: 'relative', marginTop: '100px' }}
        >
            <div
                className="lottie-animation"
                style={{ position: 'fixed', width: '100%', height: '100%', zIndex: 0}}>
                <Lottie animationData={animationData} loop={true}/>
            </div>

            <div
                style={{position:'relative', textAlign: 'center', marginBottom: '20px', fontWeight: '700', color: '#333333', fontSize: '38px', zIndex: 1}}>
                <p>Blogs</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Link to="blogs/write-blog">
                    <motion.div whileHover={{ scale: 0.92 }} whileTap={{ scale: 0.9 }}>
                        <button
                            className="font-['Montserrat'] text-center text-base font-[700] text-[#FF] border border-[#333333] border-solid rounded-[0.95rem] hover:cursor-pointer pt-3 pb-4 px-4"
                            style={{
                                borderRadius: '10px',
                                width: '150px',
                                marginBottom: '5px',
                                color: 'black',
                                fontSize: '18px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                transition: 'background-color 0.3s',
                            }}
                            onMouseEnter={(e) => { e.target.style.backgroundColor = 'black'; e.target.style.color = 'white' }}
                            onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; e.target.style.color = 'black' }}
                        >
                            Create Blog
                        </button>
                    </motion.div>

                    </Link>
                </div>
            </div>

            {loadingBlogs ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lottie style={{ width: '50%', height: '50%' }} animationData={loadingAnim} />

                </div>
            ) : (
                <div 
                    /*uncomment below line to stick the create blog button*/
                    // style={{position: 'relative', maxHeight: '100vh', overflowY: 'auto'}}
                >
                    {blogs.map((blog) => (
                        <div key={blog.slug}>
                            <BlogCard
                                blogId={blog._id}
                                title={blog.title}
                                name={blog.name}
                                blog={blog.showReadMore ? blog.preview : blog.blog}
                                blogImageUrl={blog.blogImageUrl}
                                profilePhoto={blog.profilePhotoUrl}
                                datePublished={blog.datePublished}
                                showReadMore={blog.showReadMore}
                                onReadMoreClick={() => handleBlogCardClick(blog.slug)}
                                likes={blog.likes}
                                isLiked={blog.isLiked}
                            />
                            
                        </div>
                    ))}
                    
                </div>
            )}

        </div>
    );
};
const BlogsPage = (props)=>{
    return (
        <Layout children={<Blog/>}/>
    )
}


export default BlogsPage;
