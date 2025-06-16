import React, { Fragment, useContext, useState, useEffect } from "react";
import { ProductContext } from "./index";
import { editProduct, getAllProductOfSeller } from "./FetchApi";
import { getAllCategory } from "../categories/FetchApi";
import { Trash2 } from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import CropImagePage from "./CropImagePage";
const apiURL = process.env.REACT_APP_API_URL;

const EditProductModal = (props) => {
  const { data, dispatch } = useContext(ProductContext);
  const { showErrorToast, showSuccessToast, showInfoToast } = useToast();
  const [categories, setCategories] = useState(null);

  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

  const alert = (msg, type) => (
    <div className={`bg-${type}-200 py-2 px-4 w-full`}>{msg}</div>
  );


  const [editformData, setEditformdata] = useState({
    pId: "",
    pName: "",
    pDescription: "",
    pImages: [],
    pNewImages: [],
    deleteImages: [],
    pStatus: "",
    pCategory: "",
    pQuantity: "",
    pPrice: "",
    pOffer: "",
    error: false,
    success: false,
    frontImage: 1
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    
    setImagePreviews(prev => [...prev, ...filePreviews]);
    
    setEditformdata(prev => ({
      ...prev,
      error: false,
      success: false,
      pNewImages: [...(prev.pNewImages || []), ...files], // Safely spread pNewImages
    }));
  };

  const handleImageClick = (index) => {
    // Only allow editing of newly uploaded images (Files), not server images
    
    setSelectedImage(editformData.pNewImages[index]);
    setCurrentImageIndex(index);
    setIsCropModalOpen(true);
    
  };

  const handleCropSubmit = (croppedBlob) => {
    if (croppedBlob && currentImageIndex !== null) {
      const updatedImages = [...editformData.pNewImages];
      updatedImages[currentImageIndex] = croppedBlob;

      const updatedPreviews = [...imagePreviews];
      updatedPreviews[currentImageIndex] = URL.createObjectURL(croppedBlob);

      setEditformdata({ ...editformData, pNewImages: updatedImages });
      setImagePreviews(updatedPreviews);
    }
    setIsCropModalOpen(false);
  };

  const handleDeleteImage = (e, index, type) => {
    e.preventDefault();
    if (type === "server") {
      // Deleting server image
      setEditformdata(prev => {
        const updatedServerImages = [...prev.pImages];
        const deletedImage = updatedServerImages.splice(index, 1)[0];
        
        return {
          ...prev,
          pImages: updatedServerImages,
          deleteImages: [...(prev.deleteImages || []), deletedImage], // Safely spread deleteImages
          error: false
        };
      });
    } else {
      // Deleting new image
      // const newIndex = index - editformData.pServerImages.length;
      const updatedImages = [...editformData.pNewImages];
      updatedImages.splice(index, 1);
      
      const updatedPreviews = [...imagePreviews];
      updatedPreviews.splice(index, 1);
      
      setEditformdata({ 
        ...editformData, 
        pNewImages: updatedImages,
        error: false
      });
      setImagePreviews(updatedPreviews);
    }
  };
  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    let responseData = await getAllCategory();
    if (responseData.Categories) {
      setCategories(responseData.Categories);
    }
  };

  useEffect(() => {
    setEditformdata({
      pId: data.editProductModal.pId,
      pName: data.editProductModal.pName,
      pDescription: data.editProductModal.pDescription,
      pImages: data.editProductModal.pImages,
      pStatus: data.editProductModal.pStatus,
      pCategory: data.editProductModal.pCategory?? "",
      pQuantity: data.editProductModal.pQuantity,
      pPrice: data.editProductModal.pPrice,
      pOffer: data.editProductModal.pOffer,
    });
  }, [data.editProductModal]);

  const fetchData = async () => {
    let responseData = await getAllProductOfSeller();
    if (responseData && responseData.Products) {
      dispatch({
        type: "fetchProductsAndChangeState",
        payload: responseData.Products,
      });
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Safely get lengths with fallback to 0 if undefined
    const pImagesLength = editformData.pImages?.length || 0;
    const pNewImagesLength = editformData.pNewImages?.length || 0;
    const totalImages = pImagesLength + pNewImagesLength;
    
    if (totalImages < 2 || totalImages > 6) {
      showErrorToast("Please upload at least 2 images");
      setEditformdata({ ...editformData, error: "Please upload at least 2 images" });
      setTimeout(() => {
        setEditformdata({ ...editformData, error: false, success: false });
      }, 2000);
      setLoading(false);
      return;
    }

    try {
      console.log('editformdata: ', editformData)
      let responseData = await editProduct(editformData);
      if (responseData.success) {
        showSuccessToast('Product edited successfully');
        fetchData();
        setEditformdata({ ...editformData, success: responseData.success });
        setTimeout(() => {
          setEditformdata({
            ...editformData,
            frontImage: 1,
            pImages: [...editformData.pImages, ...imagePreviews],
            pNewImages: [],
            success: responseData.success,
          });
          setImagePreviews([]);
          return;
        }, 1000);
      } else if (responseData.error) {
        setEditformdata({ ...editformData, error: responseData.error });
        showErrorToast(responseData.error);
        setTimeout(() => {
          return setEditformdata({
            ...editformData,
            error: responseData.error,
          });
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <Fragment>
      {/* Black Overlay */}
      <div
        onClick={(e) =>{
          console.log('closing modal')
          setEditformdata({
            ...editformData,
            frontImage: 1,
            pNewImages: [],
          });
          setImagePreviews([]);
          dispatch({ type: "editProductModalClose", payload: false })
        }}
        className={`${
          data.editProductModal.modal ? "" : "hidden"
        } fixed top-0 left-0 z-30 w-full h-full bg-black opacity-50`}
        />
      {/* End Black Overlay */}

      {/* Modal Start */}
      <div
        className={`${
          data.editProductModal.modal ? "" : "hidden"
        } fixed inset-0 flex items-center z-30 justify-center overflow-auto`}
        >
        <div className="mt-32 md:mt-0 relative bg-white w-11/12 md:w-3/6 shadow-lg flex flex-col items-center space-y-4 px-4 py-4 md:px-8">
          <div className="flex items-center justify-between w-full pt-4">
            <span className="text-left font-semibold text-2xl tracking-wider">
              Edit Product
            </span>
            {/* Close Modal */}
            <span
              style={{ background: "#303031" }}
              onClick={(e) =>{
                console.log('closing modal')
                setEditformdata({
                  ...editformData,
                  frontImage: 1,
                  pNewImages: [],
                });
                setImagePreviews([]);
                dispatch({ type: "editProductModalClose", payload: false })
              }
              }
              className="cursor-pointer text-gray-100 py-2 px-2 rounded-full"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
          </div>
          {/* {editformData.error ? alert(editformData.error, "red") : ""}
          {editformData.success ? alert(editformData.success, "green") : ""} */}
          <form className="w-full" onSubmit={(e) => submitForm(e)}>
            <div className="flex space-x-1">
              <div className="w-1/2 flex flex-col space-y-1 space-x-1">
                <label htmlFor="name">Product Name *</label>
                <input
                  value={editformData.pName}
                  onChange={(e) =>
                    setEditformdata({
                      ...editformData,
                      error: false,
                      success: false,
                      pName: e.target.value,
                    })
                  }
                  className="px-4 py-1 border focus:outline-none"
                  type="text"
                />
              </div>
              <div className="w-1/2 flex flex-col space-y-1 space-x-1">
                <label htmlFor="price">Product Price *</label>
                <input
                  value={editformData.pPrice}
                  onChange={(e) =>
                    setEditformdata({
                      ...editformData,
                      error: false,
                      success: false,
                      pPrice: e.target.value,
                    })
                  }
                  type="number"
                  className="px-4 py-1 border focus:outline-none"
                  id="price"
                />
              </div>
            </div>
            <div className="flex flex-col mt-1">
              <label htmlFor="description">Product Description</label>
              <span className="text-gray-600 text-xs">(Add a description for better UI)</span>
              <textarea
                value={editformData.pDescription}
                onChange={(e) =>
                  setEditformdata({
                    ...editformData,
                    error: false,
                    success: false,
                    pDescription: e.target.value,
                  })
                }
                className="px-4 py-1 border focus:outline-none"
                name="description"
                id="description"
                cols={5}
                rows={2}
              />
            </div>
            {/* Most Important part for uploading multiple image */}
            <div className="flex flex-col mt-2">
              <label htmlFor="image">Product Images *</label>
              <span className="text-gray-600 text-xs">Upload min 2 and max 6 images</span>
              <div className="flex space-x-2 mt-2">
                {editformData.pImages ? (
                  <div className="flex space-x-1">
                    {editformData.pImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          key={index}
                          className="h-16 w-16 object-cover cursor-pointer"
                          src={image}
                          alt={`productImage-${index}`}
                          onClick={() => showInfoToast("Previously uploaded images cannot be edited")}
                        />
                        <button
                          onClick={(e) => handleDeleteImage(e, index, 'server')}
                          className="absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> {/* Use the Trash2 icon */}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  ""
                )}
                {/* Vertical Line */}
                <div className="border-2 border-gray-300 mx-2"></div>
                {/* Display new images that can be edited */}
                {imagePreviews.map((image, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img
                      className="h-16 w-16 object-cover cursor-pointer"
                      src={image instanceof Blob ? URL.createObjectURL(image) : image}
                      alt={`newImage-${index}`}
                      onClick={() => handleImageClick(index)}
                    />
                    <button
                      onClick={(e) => handleDeleteImage(e, index, 'new')}
                      className="absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {imagePreviews.length>0 ? <span className="text-gray-600 text-xs">Tip: Click images to edit</span> : ""}
              <input
                onChange={handleImageChange}
                type="file"
                accept=".jpg, .jpeg, .png"
                className="px-4 py-1 border focus:outline-none mt-2"
                id="image"
                multiple
              />
            <div>
              <label className="mt-2" htmlFor="frontImage">Front Image* </label>
              <span className="text-gray-600 text-xs">(Choose image you want to show first)</span>
            </div>
            <input
                value={editformData.frontImage}
                onChange={(e) =>
                  setEditformdata({
                    ...editformData,
                    error: false,
                    success: false,
                    frontImage: e.target.value,
                  })
                }
                type="number"
                className="px-4 py-1 border focus:outline-none" 
                id="frontImage"
            />
            </div>
            <div className="flex space-x-1 py-1">
              <div className="w-1/2 flex flex-col space-y-1">
                <label htmlFor="status">Product Status *</label>
                <select
                  value={editformData.pStatus}
                  onChange={(e) =>
                    setEditformdata({
                      ...editformData,
                      error: false,
                      success: false,
                      pStatus: e.target.value,
                    })
                  }
                  name="status"
                  className="px-4 py-1 border focus:outline-none"
                  id="status"
                >
                  <option name="status" value="Active">
                    Active
                  </option>
                  <option name="status" value="Disabled">
                    Disabled
                  </option>
                </select>
              </div>
              <div className="w-1/2 flex flex-col space-y-1">
                <label htmlFor="status">Product Category</label>
                <select
                  onChange={(e) =>
                    setEditformdata({
                      ...editformData,
                      error: false,
                      success: false,
                      pCategory: e.target.value === "" ? "" : e.target.value, // Set to "" if "Select a category" is chosen
                    })
                  }
                  name="status"
                  className="px-4 py-1 border focus:outline-none"
                  id="status"
                >
                  <option value="">
                    Select a category
                  </option>
                  {categories && categories.length > 0
                    ? categories.map((elem) => {
                        return (
                          <Fragment key={elem._id}>
                            {editformData.pCategory._id &&
                            editformData.pCategory._id === elem._id ? (
                              <option
                                name="status"
                                value={elem._id}
                                key={elem._id}
                                selected
                              >
                                {elem.cName}
                              </option>
                            ) : (
                              <option
                                name="status"
                                value={elem._id}
                                key={elem._id}
                              >
                                {elem.cName}
                              </option>
                            )}
                          </Fragment>
                        );
                      })
                    : ""}
                </select>
              </div>
            </div>
            <div className="flex space-x-1 py-2">
              <div className="w-1/2 flex flex-col space-y-1">
                <label htmlFor="quantity">Product in Stock *</label>
                <input
                  value={editformData.pQuantity}
                  onChange={(e) =>
                    setEditformdata({
                      ...editformData,
                      error: false,
                      success: false,
                      pQuantity: e.target.value,
                    })
                  }
                  type="number"
                  className="px-4 py-1 border focus:outline-none"
                  id="quantity"
                />
              </div>
              <div className="w-1/2 flex flex-col space-y-1">
                <label htmlFor="offer">Product Offer (%) *</label>
                <input
                  value={editformData.pOffer}
                  onChange={(e) =>
                    setEditformdata({
                      ...editformData,
                      error: false,
                      success: false,
                      pOffer: e.target.value,
                    })
                  }
                  type="number"
                  className="px-4 py-1 border focus:outline-none"
                  id="offer"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1 w-full pb-4 md:pb-6 mt-4">
              <button
                style={{ background: loading ? "#606060":"#303031" }}
                type="submit"
                className={`px-4 py-2 rounded-full text-white ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-black hover:bg-blue-600"}`}
                disabled={loading}
              >
                {loading ? "loading..." : "Upload Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Crop Image Modal */}
      {isCropModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-4 rounded-lg shadow-lg relative w-5/6 md:w-1/2">
            <button
              onClick={() => setIsCropModalOpen(false)}
              className="absolute top-2 right-2 text-gray-700"
            >
              ✖
            </button>
            <CropImagePage
              img={selectedImage}
              onClose={() => setIsCropModalOpen(false)}
              onSubmit={handleCropSubmit}
            />
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default EditProductModal;
