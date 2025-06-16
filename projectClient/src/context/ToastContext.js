// filepath: /d:/Internships and Websites/E-commerce/MERN_Stack_Project_Ecommerce_Hayroo/client/src/context/ToastContext.js
import React, { createContext, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const showToast = (msg) => {
    toast(msg);
  };

  const showSuccessToast = (msg) => {
    toast.success(msg);
  };

  const showErrorToast = (msg) => {
    toast.error(msg);
  };

  const showInfoToast = (msg) => {
    toast.info(msg);
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccessToast, showErrorToast, showInfoToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};