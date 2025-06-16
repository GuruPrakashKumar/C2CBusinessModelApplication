import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

const BearerToken = () =>
  localStorage.getItem("tempjwt")
    ? localStorage.getItem("tempjwt")
    : false;
const Headers = () => {
  return {
    headers: {
      token: `Bearer ${BearerToken()}`,
    },
  };
};

export const isAuthenticate = () =>
  localStorage.getItem("jwt") ? JSON.parse(localStorage.getItem("jwt")) : false;

export const isAdmin = () =>
  localStorage.getItem("jwt")
    ? JSON.parse(localStorage.getItem("jwt")).user.role === 1
    : false;

export const loginReq = async ({ email, password }) => {
  const data = { email, password };
  try {
    let res = await axios.post(`${apiURL}/api/signin`, data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const signUpInit = async ({ email }) => {
  const data = { email };
  try {
    let res = await axios.post(`${apiURL}/api/signUpInit`, data);
    console.log('res', res);
    return res;
  } catch (error) {
    if( error.response.status === 409 && error.response ) {
      return error.response
    }
    console.log(error);
  }
}
export const otpVerification = async ({ email, otp }) => {
  const data = { email, otp };
  try {
    let res = await axios.post(`${apiURL}/api/otpVerification`, data);
    return res;
  } catch (error) {
    if( (error.response.status === 403 || error.response.status === 400 || error.response.status === 410) && error.response ) {
      return error.response
    }
    console.log(error);
  }
}
export const signup = async ({ name, password, cPassword, userRole, phone, address }) => {
  const data = { name, password, cPassword, userRole, phone, address };
  try {
    let res = await axios.post(`${apiURL}/api/signup`, data, Headers());
    return res;
  } catch (error) {
    if( error.response.status === 409 && error.response ) {
      return error.response
    }
    console.log(error);
  }
}
export const forgotPassInit = async ({ email }) => {
  const data = { email };
  try {
    let res = await axios.post(`${apiURL}/api/forgotPassInit`, data);
    return res;
  } catch (error) {
    if( error.response.status === 400 && error.response ) {
      return error.response
    }
    console.log(error);
  }
}
export const resetPassword = async({ password, cPassword }) => {
  const data = { password, cPassword };
  try {
    let res = await axios.post(`${apiURL}/api/resetPassword`, data, Headers());
    return res;
  } catch (error) {
    if( error.response.status === 400 && error.response ) {
      return error.response
    }
    console.log(error);
  }
}
export const signupReq = async ({ name, email, password, cPassword }) => {
  const data = { name, email, password, cPassword };
  try {
    let res = await axios.post(`${apiURL}/api/signup`, data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
