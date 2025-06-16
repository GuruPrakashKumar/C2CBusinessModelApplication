const productModel = require("../models/products");
const fs = require("fs");
const path = require("path");
const cloudinary = require('../config/cloudinary_config')
module.exports = {cloudinary};
const { extractPublicId } = require('cloudinary-build-url');//used in image uploading to delete previous profile pic from cloudinary
const sendEmail = require("../utils/sendEmail");
const { ObjectId } = require('mongoose').Types;
const { GoogleGenAI, createUserContent } = require('@google/genai');
const { model } = require("mongoose");
const userModel = require("../models/users");

class Product {
  // Delete Image from uploads -> products folder
  static deleteImages(images, mode) {
    var basePath =
      path.resolve(__dirname + "../../") + "/public/uploads/products/";
    console.log(basePath);
    for (var i = 0; i < images.length; i++) {
      let filePath = "";
      if (mode == "file") {
        filePath = basePath + `${images[i].filename}`;
      } else {
        filePath = basePath + `${images[i]}`;
      }
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        console.log("Exists image");
      }
      fs.unlink(filePath, (err) => {
        if (err) {
          return err;
        }
      });
    }
  }

  async getAllProduct(req, res) {
    try {
      let Products = await productModel
        .find({})
        .populate("pCategory", "_id cName")
        .sort({ _id: -1 });
      if (Products) {
        return res.json({ Products });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getAllProductOfSeller(req, res) {
    let { pSeller } = req.body;
    if (!pSeller) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let Products = await productModel
          .find({ pSeller })
          .populate("pCategory", "_id cName")
          .sort({ _id: -1 });
        if (Products) {
          return res.json({ Products });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postAddProduct(req, res) {
    let { pName, pDescription, pPrice, pQuantity, pCategory, pOffer, pStatus, pSeller } =
      req.body;
    let images = req.files;
    // Validation
    if (
      !pName |
      !pPrice |
      !pQuantity |
      !pOffer |
      !pStatus | 
      !pSeller
    ) {
      Product.deleteImages(images, "file");
      return res.json({ error: "All filled must be required" });
    }
    // Validate Name and description
    else if (pName.length > 255 || pDescription.length > 3000) {
      Product.deleteImages(images, "file");
      return res.json({
        error: "Name 255 & Description must not be 3000 charecter long",
      });
    }
    // Validate Images
    else if (images.length < 2 || images.length > 6) {
      Product.deleteImages(images, "file");
      return res.json({ error: "You can upload 2 to 6 images only" });
    } else {
        try {
          //first check product safety
          const result = await checkProductSafety(pName, pDescription, images);
          if(!result.violatesGuidelines){//seller is not violating guidelines, proceed add product
            let allImages = [];
        
            // Map each image upload to a promise
            const uploadPromises = images.map(img => {
              return new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                  img.path,
                  { transformation: [{ quality: 'auto:low' }] },
                  (err, resp) => {
                    if (err) {
                      console.error(err);
                      Product.deleteImages(images, "file");
                      reject(err);
                    } else {
                      resolve(resp.url);
                    }
                  }
                );
              });
            });
          
            // Wait for all uploads to complete
            allImages = await Promise.all(uploadPromises);
          
            // Proceed with creating the product after all images are uploaded
            let newProductData = {
              pImages: allImages,
              pName,
              pDescription: " ",
              pPrice,
              pQuantity,
              pOffer,
              pStatus,
              pSeller
            };
            if(pCategory){newProductData.pCategory = pCategory;}
            if(pDescription){newProductData.pDescription = pDescription;}
            let newProduct = new productModel(newProductData);
            let save = await newProduct.save();
            if (save) {
              return res.json({ success: "Product created successfully" });
            }
          }else{//seller violating guidelines, stop adding product
            const sellerEmail = await userModel.findById(pSeller).select("name email");
            const reason = result.reason;
            const warningMessage = `
            Dear ${sellerEmail.name},

            We regret to inform you that your product "${pName}" has been flagged for violating our community guidelines.

            **Violation Reason:** 
            ${reason}

            Hence the product is not added to your products.

            **Next Steps:**
            1. Make sure to follow the community guidelines.
            2. Edit or remove the violating content.
            3. Retry adding the corrected product or content.

            We value your participation in our marketplace and are available to help you comply with our policies.

            Sincerely,
            The SaversPoint Team
            `;
            await sendEmail({ email: sellerEmail.email, message: warningMessage, subject: 'Violation of Community Guidelines' })
            return res.status(200).json({error: "Violated Community Guidelines"});
          }
          
        } catch (err) {
          console.log(err);
        }
      
    }
  }

  async postEditProduct(req, res) {
    let {pId, pName, pDescription, pPrice, pQuantity, pCategory, pOffer, pStatus, pImages, deleteImages, frontImage} = req.body;
    let newImages = req.files;
    // console.log('req.body: ',req.body)
    // console.log('req.files ', req.files)

    // Validate other fileds
    pImages = pImages.split(",");
    if (
      !pId |
      !pName |
      !pPrice |
      !pQuantity |
      !pOffer |
      !pStatus | !frontImage
    ) {
      return res.json({ error: "All filled must be required" });
    }
    // Validate Name and description
    else if (pName.length > 255 || pDescription.length > 3000) {
      return res.json({
        error: "Name 255 & Description must not be 3000 charecter long",
      });
    }
    // Validate Update Images
    else if (pImages && (newImages.length+pImages.length < 2 || newImages.length+pImages.length > 6)) {
      Product.deleteImages(newImages, "file");
      return res.json({ error: "Must need to provide 2 images" });
    } else {
      console.log('pStatus from client: ', pStatus)
      let editData = {
        pName,
        pPrice,
        pQuantity,
        pOffer,
        pStatus,
      };
      if(pCategory && pCategory != 'undefined'){editData.pCategory = pCategory;}
      if(pCategory === "") editData.pCategory = null;
      if(pDescription || pDescription!='undefined'){editData.pDescription = pDescription;}

      let allnewImages = [];
      if (newImages.length+pImages.length > 1 && newImages.length+pImages.length < 7) {
        const uploadPromises = newImages.map(img => {
            return new Promise((resolve, reject) => {
              cloudinary.uploader.upload(
                img.path,
                { transformation: [{ quality: 'auto:low' }] },
                (err, resp) => {
                  if (err) {
                    console.error(err);
                    Product.deleteImages(newImages, "file");
                    reject(err);
                  } else {
                    resolve(resp.url);
                  }
                }
              );
            });
          });
        allnewImages = await Promise.all(uploadPromises)
        editData.pImages = [...pImages, ...allnewImages];
        // set front image according to user input
        let frontIndex = frontImage - 1;
        if(frontIndex >= (editData.pImages.length)){
          frontIndex = editData.pImages.length - 1;
        }
        const tempFrontImage = editData.pImages.splice(frontIndex, 1)[0];
        editData.pImages.unshift(tempFrontImage);
        Product.deleteImages(pImages, "string");
      }
      try {
        // const prevProduct = await productModel.findById(pId)
        
        // let prevImages=[]
        // prevImages = editProduct.pImages;
        //todo: handle promises and delete properly
        if(deleteImages != 'undefined'){
          deleteImages = deleteImages.split(",");
          if(deleteImages.length>0){
            const deletePromises = deleteImages.map(img=>{
              return new Promise((resolve) => {
                const prevImageID = extractPublicId(img)
                cloudinary.uploader.destroy(prevImageID, (deleteErr, deleteResp)=>{
                  console.log('deleting image :', img)
                  if(deleteErr){
                    console.error(deleteErr);
                    console.log(`This img is not deleted ${img}`)
                    resolve({success: false, img})
                  } else {
                    console.log('Successfully deleted image')
                    resolve({success: true, img})
                  }
                });
              });
            });

            await Promise.all(deletePromises)
          }
        }
        let editProduct = productModel.findByIdAndUpdate(pId, editData);
        editProduct.exec((err) => {
          if (err) console.log(err);
          return res.json({ success: "Product edit successfully" });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getDeleteProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteProductObj = await productModel.findById(pId);
        for(const img of deleteProductObj.pImages){
          const prevImageID = extractPublicId(img)
          console.log('deleting image with id:', prevImageID)
          cloudinary.uploader.destroy(prevImageID, (deleteErr, deleteResp)=>{
            if(deleteErr){
              console.error(deleteErr);
              console.log(`This img is not deleted ${img}`)
            }
          });
        }
        let deleteProduct = await productModel.findByIdAndDelete(pId);
        if (deleteProduct) {
          // Delete Image from uploads -> products folder
          Product.deleteImages(deleteProductObj.pImages, "string");
          return res.json({ success: "Product deleted successfully" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getSingleProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let singleProduct = await productModel
          .findById(pId)
          .populate("pCategory", "cName")
          .populate("pRatingsReviews.user", "name email userImage");
        if (singleProduct) {
          return res.json({ Product: singleProduct });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getProductByCategory(req, res) {
    let { catId } = req.body;
    if (!catId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pCategory: catId })
          .populate("pCategory", "cName");
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Search product wrong" });
      }
    }
  }

  async getProductByPrice(req, res) {
    let { price } = req.body;
    if (!price) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pPrice: { $lt: price } })
          .populate("pCategory", "cName")
          .sort({ pPrice: -1 });
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getWishProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let wishProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (wishProducts) {
          return res.json({ Products: wishProducts });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getCartProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let cartProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (cartProducts) {
          return res.json({ Products: cartProducts });
        }
      } catch (err) {
        return res.json({ error: "Cart product wrong" });
      }
    }
  }

  async postAddReview(req, res) {
    let { pId, uId, rating, review } = req.body;
    if (!pId || !rating || !review || !uId) {
      return res.json({ error: "All filled must be required" });
    } else {
      let checkReviewRatingExists = await productModel.findOne({ _id: pId });
      if (checkReviewRatingExists.pRatingsReviews.length > 0) {
        checkReviewRatingExists.pRatingsReviews.map((item) => {
          if (item.user === uId) {
            return res.json({ error: "Your already reviewd the product" });
          } else {
            try {
              let newRatingReview = productModel.findByIdAndUpdate(pId, {
                $push: {
                  pRatingsReviews: {
                    review: review,
                    user: uId,
                    rating: rating,
                  },
                },
              });
              newRatingReview.exec((err, result) => {
                if (err) {
                  console.log(err);
                }
                return res.json({ success: "Thanks for your review" });
              });
            } catch (err) {
              return res.json({ error: "Cart product wrong" });
            }
          }
        });
      } else {
        try {
          let newRatingReview = productModel.findByIdAndUpdate(pId, {
            $push: {
              pRatingsReviews: { review: review, user: uId, rating: rating },
            },
          });
          newRatingReview.exec((err, result) => {
            if (err) {
              console.log(err);
            }
            return res.json({ success: "Thanks for your review" });
          });
        } catch (err) {
          return res.json({ error: "Cart product wrong" });
        }
      }
    }
  }

  async deleteReview(req, res) {
    let { rId, pId } = req.body;
    if (!rId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let reviewDelete = productModel.findByIdAndUpdate(pId, {
          $pull: { pRatingsReviews: { _id: rId } },
        });
        reviewDelete.exec((err, result) => {
          if (err) {
            console.log(err);
          }
          return res.json({ success: "Your review is deleted" });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }


  async postReportProduct(req, res){
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    try {
      const { productId, reason, message, userId } = req.body;
      // Validate input
      if (!ObjectId.isValid(productId)) {
          return res.status(400).json({ error: "Invalid product ID" });
      }

      if (![1, 2, 3, 4].includes(reason)) {
          return res.status(400).json({ error: "Invalid reason code" });
      }

      // Get product details (including images)
      const product = await productModel.findById(productId)
          .populate('pSeller', 'email')
          .select('pName pImages pStatus pPrice');
      if (!product) {
          return res.status(404).json({ error: "Product not found" });
      }

      // Extract first 2 image URLs (assuming pImages is an array of strings)
      const productImages = product.pImages.slice(0, 2);

      if (reason === 1) {
          // Case 1: Missing info - just acknowledge
          // send email to seller that there is something missing info
          const missingInfo = `Greetings Seller. Your product named "${product.pName}", Price: ${product.pPrice}, have some Missing Information or the information may be improved.
              Kindly edit and update the product details. Thank you.`
          await sendEmail({ email: product.pSeller.email, message: missingInfo, subject: 'Missing Information of your Product' })
          return res.json({ 
              message: "Seller will be notified to improve the listing.",
              action: "email_seller"
          });
      } 
      else if (reason === 2 || reason === 3) {

          const prompt = `Analyze this product report and determine if it violates guidelines: 
          Product Name: ${product.pName},
          Report Reason: ${reason === 2 ? "Offensive content" : "Illegal/unsafe content"}, 
          User Message: ${message} Carefully examine the product images and description.
          After checking the name, check Images if they are Illegal/unsafe then decide.
          Respond ONLY with "true" if the product clearly violates guidelines (offensive, illegal, or unsafe), or "false" if it appears acceptable.`;
          const parts = [
            {text: prompt}
          ];
          for(const imgUrl of productImages){
            const base64Image = await urlToBase64(imgUrl);
            if(base64Image){
              parts.push({
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image
                }
              })
            }
          }
          //FOR ONE IMAGE UPLOADING
          // const responseFromFetch = await fetch(productImages[0]);
          // const imageArrayBuffer = await responseFromFetch.arrayBuffer();
          // const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');
          
          // Call Gemini API
          // const response = await ai.models.generateContent({
          //   model: "gemini-2.0-flash",
          //   contents: [
          //     {
          //       inlineData: {
          //         mimeType: 'image/jpeg',
          //         data: base64ImageData,
          //       },
          //     },
          //     {text: prompt}
          //   ],
          // })
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: createUserContent(parts),
          })
          const text = response.text.trim().toLowerCase();
          const isViolation = text === "true";

          if (isViolation) {
              // Deactivate product
              await productModel.findByIdAndUpdate(productId, { 
                  pStatus: "Disabled",
                });
              
                //send email to seller and buyer
              const deactivationReason = reason === 2 ? "Offensive content" : "Illegal/unsafe"
              const warningMessage = `Greetings Seller. Your product named "${product.pName}", Price: ${product.pPrice}, have violated our community guidelines.
              Reason: ${deactivationReason}.
              Hence the product is disabled temporarily. If there will be multiple violations from your side then you may be permanently blocked.
              If you disagree this mail then raise a ticket/contact admin.`
              await sendEmail({ email: product.pSeller.email, message: warningMessage, subject: 'Violation of Community Guidelines' })
              
              const msgToReporter = `Your recent report to product named "${product.pName}", Price: ${product.pPrice}, has been successfully reviewed.
              The product violate our community guidelines,hence the product has been disabled.
              Thank you for reporting.`
              const reporter = await userModel.findById(userId).select('email');
              await sendEmail({ email: reporter.email, message: msgToReporter, subject: 'Thank You for Reporting !' })

              return res.json({ 
                  message: "Product deactivated after review.",
                  action: "product_deactivated",
                  geminiResponse: text,
                  violationFound: true
              });
          } else {
            //send email to buyer that this doesn't violate our community guidelines
              const msgToReporter = `Your recent report to product named "${product.pName}", Price: ${product.pPrice}, has been successfully reviewed.
              The Product does not violate our community guidelines.
              Thank you for reporting.`
              const reporter = await userModel.findById(userId).select('email');
              await sendEmail({ email: reporter.email, message: msgToReporter, subject: 'Thank You for Reporting !' })
              return res.json({ 
                  message: "No violations found after review.",
                  action: "no_violation",
                  geminiResponse: text,
                  violationFound: false
              });
          }
      }
      else { // Reason 4
        // todo: in this condition it will be reviewed by admin
          return res.json({ 
              message: "Report submitted for manual review.",
              action: "under_review" 
          });
      }

  } catch (err) {
      console.error("Error reporting product:", err);
      return res.status(500).json({ 
          error: "Internal server error",
          details: err.message 
      });
  }
  }
}

async function checkProductSafety(name, description, photos){//return yes if violates guidelines else no
    try {
      
      // Initialize with API key
      const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
      const prompt = `Analyze this product report and determine if it violates guidelines: 
          Product Name: ${name},
          Report Reason: "Illegal/unsafe content or offensive content", 
          Carefully examine the product images and description.
          After checking the name, check Images if they are Illegal/unsafe then decide.
          Respond with proper reason.
          Format your response EXACTLY like this:
          Decision: YES/NO
          Reason: [your explanation here]`;
      const promptParts = [
        {text: prompt}
      ];

      // Process images if available
      if (photos?.length > 0) {
        for (const photo of photos) {
          const imagePath = path.join(photo.path);
          console.log('paths: ')
          console.log(photo.path)
          const imageData = fs.readFileSync(photo.path, {encoding: "base64",});
          promptParts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData
            }
          });
        }
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: createUserContent(promptParts)
      });
      const text = response.text.toLowerCase().trim();
      // Parse the response
      const decisionMatch = text.match(/Decision:\s*(YES|NO)/i);
      const reasonMatch = text.match(/Reason:\s*(.+)/i);

      const decision = decisionMatch ? decisionMatch[1].toUpperCase() === "YES" : false;
      const reason = reasonMatch ? reasonMatch[1].trim() : "No reason provided";
      
      return {
        violatesGuidelines: decision,
        reason: reason
      };

    } catch (error) {    
      console.error("Safety check error:", error);
    }
  }
async function urlToBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const imageArrayBuffer = await response.arrayBuffer();
    return Buffer.from(imageArrayBuffer).toString('base64');
  } catch (error) {
    console.error("Error converting image to Base64:", error);
    return null;
  }
}
const productController = new Product();
module.exports = productController;
