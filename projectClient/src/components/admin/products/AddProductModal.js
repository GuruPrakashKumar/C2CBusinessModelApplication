import React, { Fragment, useContext, useEffect, useState } from "react";
import { ProductContext } from "./index";
import { createProduct, getAllProductOfSeller } from "./FetchApi";
import { getAllCategory } from "../categories/FetchApi";
import CropImagePage from "./CropImagePage"; // Import the CropImagePage component
import { Trash2 } from "lucide-react";
import { useToast } from "../../../context/ToastContext";
const AddProductDetail = ({ categories }) => {
  const { data, dispatch } = useContext(ProductContext);
  const { showErrorToast, showSuccessToast, showInfoToast } = useToast();

  const alert = (msg, type) => (
    <div className={`bg-${type}-200 py-2 px-4 w-full`}>{msg}</div>
  );

  const [fData, setFdata] = useState({
    pName: "",
    pDescription: "",
    pStatus: "Active",
    pImage: [],
    pCategory: "",
    pPrice: "",
    pOffer: 0,
    pQuantity: "",
    success: false,
    error: false,
    frontImage: 1
  });

  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

  const fetchData = async () => {
    let responseData = await getAllProductOfSeller();
    setTimeout(() => {
      if (responseData && responseData.Products) {
        dispatch({
          type: "fetchProductsAndChangeState",
          payload: responseData.Products,
        });
      }
    }, 1000);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...filePreviews]);
    setFdata({
      ...fData,
      error: false,
      success: false,
      pImage: [...fData.pImage, ...files],
    });
  };

  const handleImageClick = (index) => {
    setSelectedImage(fData.pImage[index]);
    setCurrentImageIndex(index);
    setIsCropModalOpen(true);
  };

  const handleCropSubmit = (croppedBlob) => {
    if (croppedBlob && currentImageIndex !== null) {
      const updatedImages = [...fData.pImage];
      updatedImages[currentImageIndex] = croppedBlob;

      const updatedPreviews = [...imagePreviews];
      updatedPreviews[currentImageIndex] = URL.createObjectURL(croppedBlob);

      setFdata({ ...fData, pImage: updatedImages });
      setImagePreviews(updatedPreviews);
    }
    setIsCropModalOpen(false);
  };

  const handleDeleteImage = (e, index) => {
    e.preventDefault();
    const updatedImages = [...fData.pImage];
    updatedImages.splice(index, 1);
  
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
  
    setFdata({ ...fData, pImage: updatedImages, error: false }); // Reset error here
    setImagePreviews(updatedPreviews);

  };

  const submitForm = async (e) => {
    e.preventDefault();
    e.target.reset();

    setLoading(true);
    if (fData.pImage.length < 2 || fData.pImage.length > 6) {
      showErrorToast("Please upload at least 2 images");
      setFdata({ ...fData, error: "Please upload at least 2 images" });
      setTimeout(() => {
        setFdata({ ...fData, error: false, success: false });
      }, 2000);
      setLoading(false);
      return;
    }

    // Rearrange images based on frontImage input
    let frontIndex = fData.frontImage - 1;
    if (frontIndex >= fData.pImage.length) {
      frontIndex = fData.pImage.length - 1;
    }
    const frontImage = fData.pImage.splice(frontIndex, 1)[0];
    fData.pImage.unshift(frontImage);
    try {
      // console.log('fData in submit form: ', fData)
      let responseData = await createProduct(fData);
      if (responseData.success) {
        showSuccessToast('Product created successfully');
        fetchData();
        setFdata({
          ...fData,
          pName: "",
          pDescription: "",
          pImage: [],
          pStatus: "Active",
          pCategory: "",
          pPrice: "",
          pQuantity: "",
          pOffer: 0,
          success: responseData.success,
          error: false,
        });
        setImagePreviews([]);
        setTimeout(() => {
          setFdata({
            ...fData,
            pName: "",
            pDescription: "",
            pImage: "",
            pStatus: "Active",
            pCategory: "",
            pPrice: "",
            pQuantity: "",
            pOffer: 0,
            success: false,
            error: false,
          });
        }, 2000);
      } else if (responseData.error) {
        setFdata({ ...fData, success: false, error: responseData.error });
        showErrorToast(responseData.error);
        setTimeout(() => {
          return setFdata({ ...fData, error: false, success: false });
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
        onClick={(e) => dispatch({ type: "addProductModal", payload: false })}
        className={`${
          data.addProductModal ? "" : "hidden"
        } fixed top-0 left-0 z-30 w-full h-full bg-black opacity-50`}
      />
      {/* End Black Overlay */}

      {/* Modal Start */}
      <div
        className={`${
          data.addProductModal ? "" : "hidden"
        } fixed inset-0 flex items-center z-30 justify-center overflow-auto`}
      >
        <div className="mt-32 md:mt-0 relative bg-white w-11/12 md:w-3/6 shadow-lg flex flex-col items-center space-y-4 px-4 py-4 md:px-8">
          <div className="flex items-center justify-between w-full pt-4">
            <span className="text-left font-semibold text-2xl tracking-wider">
              Add Product
            </span>
            {/* Close Modal */}
            <span
              style={{ background: "#303031" }}
              onClick={(e) =>
                dispatch({ type: "addProductModal", payload: false })
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
          {fData.error ? alert(fData.error, "red") : ""}
          {fData.success ? alert(fData.success, "green") : ""}
          <form className="w-full" onSubmit={(e) => submitForm(e)}>
            <div className="flex space-x-1">
              <div className="w-1/2 flex flex-col space-y-1 space-x-1">
                <label htmlFor="name">Product Name *</label>
                <input
                  value={fData.pName}
                  onChange={(e) =>
                    setFdata({
                      ...fData,
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
                  value={fData.pPrice}
                  onChange={(e) =>
                    setFdata({
                      ...fData,
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
                value={fData.pDescription}
                onChange={(e) =>
                  setFdata({
                    ...fData,
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
            {/* for uploading multiple image */}

            <div className="flex flex-col mt-2">
              <label htmlFor="image">Product Images *</label>
              <span className="text-gray-600 text-xs">Upload min 2 and max 6 images</span>
              <div className="flex space-x-2 mt-2">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative">
                    <img
                      src={src}
                      alt={`preview-${index}`}
                      className="w-16 h-16 object-cover cursor-pointer"
                      onClick={() => handleImageClick(index)}
                    />
                    <button
                      onClick={(e) => handleDeleteImage(e, index)}
                      className="absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> {/* Use the Trash2 icon */}
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
                value={fData.frontImage}
                onChange={(e) =>
                  setFdata({
                    ...fData,
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

            <div className="flex space-x-1 py-2">
              <div className="w-1/2 flex flex-col space-y-1">
                <label htmlFor="status">Product Status *</label>
                <select
                  value={fData.pStatus}
                  onChange={(e) =>
                    setFdata({
                      ...fData,
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
                  value={fData.pCategory}
                  onChange={(e) =>
                    setFdata({
                      ...fData,
                      error: false,
                      success: false,
                      pCategory: e.target.value,
                    })
                  }
                  name="status"
                  className="px-4 py-1 border focus:outline-none"
                  id="status"
                >
                  <option value="">
                    Select a category
                  </option>
                  {categories.length > 0
                    ? categories.map(function (elem) {
                        return (
                          <option name="status" value={elem._id} key={elem._id}>
                            {elem.cName}
                          </option>
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
                  value={fData.pQuantity}
                  onChange={(e) =>
                    setFdata({
                      ...fData,
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
                  value={fData.pOffer}
                  onChange={(e) =>
                    setFdata({
                      ...fData,
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
                {loading ? "Uploading..." : "Create Product"}
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

const AddProductModal = (props) => {
  useEffect(() => {
    fetchCategoryData();
  }, []);

  const [allCat, setAllCat] = useState({});

  const fetchCategoryData = async () => {
    let responseData = await getAllCategory();
    if (responseData.Categories) {
      setAllCat(responseData.Categories);
    }
  };

  return (
    <Fragment>
      <AddProductDetail categories={allCat} />
    </Fragment>
  );
};

export default AddProductModal;