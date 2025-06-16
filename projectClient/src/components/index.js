import React from "react";
import {
  Home,
  WishList,
  ProtectedRoute,
  AdminProtectedRoute,
  CartProtectedRoute,
  PageNotFound,
  ProductDetails,
  ProductByCategory,
  CheckoutPage,
} from "./shop";
import { DashboardAdmin, Categories, Products, Orders, Bids, BankDetails } from "./admin";
import { UserProfile, UserOrders, SettingUser } from "./shop/dashboardUser";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ContactUsPage from "./shop/partials/ContactUs";
import BlogsPage from "./blog/BlogsPage";
import WriteBlogsPage from "./blog/WriteBlogs";
import BlogRegistrationPage from "./blog/BlogRegistration";
import IndividualBlogPage from "./blog/IndividualBlog";
import CreateAccountPage from "./shop/auth/CreateAccount";
import ForgotPassword from "./shop/auth/ForgotPassword";
import CropImagePage from "./admin/products/CropImagePage";
import RespondBid from "./admin/bids/RespondToBid";

/* Routing All page will be here */
const Routes = (props) => {
  return (
    <Router>
      <Switch>
        {/* Shop & Public Routes */}
        <Route exact path="/contact-us" component={ContactUsPage}/>
        <Route exact path="/" component={Home} />
        <Route exact path="/wish-list" component={WishList} />
        <Route exact path="/products/:id" component={ProductDetails} />
        <Route exact path="/blogs" component={BlogsPage}/>
        <Route exact path="/blogs/write-blog" component={WriteBlogsPage}/>
        <Route exact path="/blogs/register" component={BlogRegistrationPage}/>
        <Route exact path="/blogs/get/:slug" component={IndividualBlogPage}/>
        <Route path="/create-account" component={CreateAccountPage}/>
        <Route path="/forgot-password" component={ForgotPassword}/>
        <Route path="/image-crop" component={CropImagePage}/>
        <Route
          exact
          path="/products/category/:catId"
          component={ProductByCategory}
        />
        <CartProtectedRoute
          exact={true}
          path="/checkout"
          component={CheckoutPage}
        />
        {/* Shop & Public Routes End */}

        {/* Admin Routes */}
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard"
          component={DashboardAdmin}
        />
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard/bankDetails"
          component={BankDetails}
        />
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard/categories"
          component={Categories}
        />
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard/products"
          component={Products}
        />
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard/orders"
          component={Orders}
        />
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard/bids"
          component={Bids}
        />
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard/bids/respondBid/:bidId"
          component={RespondBid}
        />
        {/* Admin Routes End */}

        {/* User Dashboard */}
        <ProtectedRoute
          exact={true}
          path="/user/profile"
          component={UserProfile}
        />
        <ProtectedRoute
          exact={true}
          path="/user/orders"
          component={UserOrders}
        />
        <ProtectedRoute
          exact={true}
          path="/user/setting"
          component={SettingUser}
        />
        {/* User Dashboard End */}

        {/* 404 Page */}
        <Route component={PageNotFound} />
      </Switch>
    </Router>
  );
};

export default Routes;
