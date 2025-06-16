const { toTitleCase } = require("../config/function");
const categoryModel = require("../models/categories");
const fs = require("fs");
const cloudinary = require('../config/cloudinary_config')
const { extractPublicId } = require('cloudinary-build-url');//used in image uploading to delete previous profile pic from cloudinary

module.exports = {cloudinary};

class Category {
  async getAllCategory(req, res) {
    try {
      let Categories = await categoryModel.find({}).sort({ _id: -1 });
      if (Categories) {
        return res.json({ Categories });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async postAddCategory(req, res) {
    let { cName, cDescription, cStatus } = req.body;
    
    const file = req.file.path;//image temp path
    // let cImage = req.file.filename;
    // const filePath = `../server/public/uploads/categories/${cImage}`;
    let cImage;
    if (!cName || !cDescription || !cStatus || !file) {
      // fs.unlink(filePath, (err) => {
      //   if (err) {
      //     console.log(err);
      //   }
        return res.json({ error: "All filled must be required" });
      // });
    } else {
      cName = toTitleCase(cName);
      try {
        const resp = await cloudinary.uploader.upload(file, {
          transformation: [{ quality: 'auto:low' }],
        });

        console.log("line 46")
        cImage = resp.url;
        console.log("cImage")
        console.log(cImage)
        let checkCategoryExists = await categoryModel.findOne({ cName: cName });
        if (checkCategoryExists) {
          // fs.unlink(filePath, (err) => {
          //   if (err) {
          //     console.log(err);
          //   }
            return res.json({ error: "Category already exists" });
          // });
        } else {
          let newCategory = new categoryModel({
            cName,
            cDescription,
            cStatus,
            cImage,
          });
          await newCategory.save((err) => {
            if (!err) {
              return res.json({ success: "Category created successfully" });
            }
          });
        }
        
      } catch (err) {
        console.log("error in lin n72")
        console.log(err);
      }
    }
  }

  async postEditCategory(req, res) {
    let { cId,cName, cDescription, cStatus } = req.body;
    if (!cId || !cName || !cDescription || !cStatus) {
      return res.json({ error: "All filled must be required" });
    }
    try {
      let editCategory = categoryModel.findByIdAndUpdate(cId, {
        cName,
        cDescription,
        cStatus,
        updatedAt: Date.now(),
      });
      let edit = await editCategory.exec();
      if (edit) {
        return res.json({ success: "Category edit successfully" });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getDeleteCategory(req, res) {
    let { cId } = req.body;
    if (!cId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deletedCategoryFile = await categoryModel.findById(cId);
        const filePath = `../server/public/uploads/categories/${deletedCategoryFile.cImage}`;
        const prevImageID = extractPublicId(deletedCategoryFile.cImage)
          cloudinary.uploader.destroy(prevImageID, (deleteErr, deleteResp)=>{
            if(deleteErr){
              console.error(deleteErr);
              console.log(`This img is not deleted ${img}`)
            }
          });
        let deleteCategory = await categoryModel.findByIdAndDelete(cId);
        if (deleteCategory) {
          // Delete Image from uploads -> categories folder 
          fs.unlink(filePath, (err) => {
            if (err) {
              console.log(err);
            }
            return res.json({ success: "Category deleted successfully" });
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}

const categoryController = new Category();
module.exports = categoryController;
