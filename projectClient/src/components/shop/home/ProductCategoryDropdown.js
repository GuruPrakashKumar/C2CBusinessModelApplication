import React, { Fragment, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { HomeContext } from "./index";
import { getAllCategory } from "../../admin/categories/FetchApi";
import { getAllProduct, productByPrice } from "../../admin/products/FetchApi";
import "./style.css";

const apiURL = process.env.REACT_APP_API_URL;


const CategoryList = () => {
  const history = useHistory();
  const { data } = useContext(HomeContext);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const responseData = await getAllCategory();
      if (responseData?.Categories) {
        setCategories(responseData.Categories);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
        {categories.length > 0 ? (
          categories.map((category, index) => (
            <div
              onClick={(e) => history.push(`/products/category/${category._id}`)}
              key={index}
              className="flex-shrink-0 px-4 py-2 border rounded-lg cursor-pointer hover:bg-yellow-100"
            >
              <div className="flex justify-center items-center">
                <img
                  src={`${category.cImage}`}
                  alt={category.cName}
                  style={{ borderRadius: "20%" }}
                  className="w-24 h-24 object-cover"
                />
              </div>
              <div className="mt-2 text-center">{category.cName}</div>
            </div>
          ))
        ) : (
          <div>{/*No Categories Available*/}</div>
        )}
      </div>
    </div>
  );
};


const FilterList = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [selectedPrice, setSelectedPrice] = useState("all");

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "100", label: "Under ₹100" },
    { value: "500", label: "Under ₹500" },
    { value: "1000", label: "Under ₹1,000" },
    { value: "5000", label: "Under ₹5,000" },
    { value: "10000", label: "Under ₹10,000" }
  ];

  const handlePriceChange = (e) => {
    const price = e.target.value;
    setSelectedPrice(price);
    fetchData(price);
  };

  const fetchData = async (price) => {
    if (price === "all") {
      try {
        let responseData = await getAllProduct();
        if (responseData && responseData.Products) {
          dispatch({ type: "setProducts", payload: responseData.Products });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      dispatch({ type: "loading", payload: true });
      try {
        setTimeout(async () => {
          let responseData = await productByPrice(price);
          if (responseData && responseData.Products) {
            dispatch({ type: "setProducts", payload: responseData.Products });
            dispatch({ type: "loading", payload: false });
          }
        }, 700);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const closeFilterBar = () => {
    fetchData("all");
    dispatch({ type: "filterListDropdown", payload: !data.filterListDropdown });
    setSelectedPrice("all");
  };

  return (
    <div className={`${data.filterListDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="font-medium">Filter by price:</div>
            <select
              value={selectedPrice}
              onChange={handlePriceChange}
              className="p-2 border-2 border-black rounded-md focus:outline focus:ring-2 focus:ring-yellow-500"
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          <div onClick={(e) => closeFilterBar()} className="cursor-pointer">
            <svg
              className="w-8 h-8 text-gray-700 hover:bg-gray-200 rounded-full p-1"
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
          </div>
        </div>
      </div>
    </div>
  );
};

const Search = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [search, setSearch] = useState("");
  const [productArray, setPa] = useState(null);

  const searchHandle = (e) => {
    setSearch(e.target.value);
    fetchData();
    dispatch({
      type: "searchHandleInReducer",
      payload: e.target.value,
      productArray: productArray,
    });
  };

  const fetchData = async () => {
    dispatch({ type: "loading", payload: true });
    try {
      setTimeout(async () => {
        let responseData = await getAllProduct();
        if (responseData && responseData.Products) {
          setPa(responseData.Products);
          dispatch({ type: "loading", payload: false });
        }
      }, 700);
    } catch (error) {
      console.log(error);
    }
  };

  const closeSearchBar = () => {
    dispatch({ type: "searchDropdown", payload: !data.searchDropdown });
    fetchData();
    dispatch({ type: "setProducts", payload: productArray });
    setSearch("");
  };

  return (
    <div
      className={`${data.searchDropdown ? "" : "hidden"
        } my-4 flex items-center justify-between`}
    >
      <input
        value={search}
        onChange={(e) => searchHandle(e)}
        className="px-4 text-l py-4 border-2 border-black-500 rounded-md focus:outline-none"
        type="text"
        placeholder="Search products..."
      />
      <div onClick={(e) => closeSearchBar()} className="cursor-pointer">
        <svg
          className="w-8 h-8 text-gray-700 hover:bg-gray-200 rounded-full p-1"
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
      </div>
    </div>
  );
};

const ProductCategoryDropdown = (props) => {
  return (
    <Fragment>
      <CategoryList />
      <FilterList />
      <Search />
    </Fragment>
  );
};

export default ProductCategoryDropdown;
