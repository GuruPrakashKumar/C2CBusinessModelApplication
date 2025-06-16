import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import animationData from '../animations/blog-animation.json';
import Lottie from 'lottie-react';
import Layout from '../shop/layout';
import { useHistory } from "react-router-dom";
const inputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  margin: '10px 0',
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  background: '#007BFF',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
};

function BlogRegistration() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  // const navigate = useNavigate();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/blog/register-for-blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        localStorage.setItem('userEmail', email);
        history.replace('/blogs');
        // navigate('/blogs-page', { replace: true });
      } else if (response.status == 409) {
        alert("User already Exists !!");
      } else {
        alert("Server error, please try again later");
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="bg-[#F2F2F2]" style={{aspectRatio:'auto', display: 'flex', flexWrap: 'wrap', placeItems: 'center', justifyItems: 'center', justifyContent: 'center', alignItems: 'center', alignContent: 'center', background: '#F2F2F2', marginTop: '100px'}}>
     
      <div className="animation-container" style={{ flexBasis: 200 }}>
        <Lottie animationData={animationData} style={{ minWidth:'400px',maxWidth:'500px' }} />
      </div>

      {/* card container */}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {/* card */}
        <div style={{
          border: '2px solid #ccc', borderRadius: '8px', padding: '16px', margin: '20px 10px 20px 10px', boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)', backgroundColor: 'white'
        }}>
          <div className="text-center text-['Poppins'] text-[2.25rem] font-[700] text-[#333333]">
            <p>Registration For Blogs</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                style={inputStyle}
                required value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                style={inputStyle}
                required value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                style={inputStyle}
                required value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" style={buttonStyle} disabled={isRegistering}>
              {isRegistering ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
const BlogRegistrationPage = (props)=>{
  return (
      <Layout children={<BlogRegistration/>}/>
  )
}

export default BlogRegistrationPage;
