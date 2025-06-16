const orderModel = require("../models/orders");
const productModel = require("../models/products");
const userModel = require("../models/users");
const sendEmail = require("../utils/sendEmail");
class Order {
  async getAllOrders(req, res) {
    try {
        const sellerId = req.body.sellerId; //getting seller id to filter orders according to seller
        
        // First, find all orders that have at least one product belonging to this seller
        let orders = await orderModel.find({
            "allProduct.pSeller": sellerId
        })
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 })
        .lean(); // Convert to plain JavaScript object for manipulation
        if (orders) {
            // Filter each order to only include products belonging to this seller
            // and calculate the new amount based on those products
            const filteredOrders = orders.map(order => {
                // Filter products
                const sellerProducts = order.allProduct.filter(
                    product => product.pSeller.toString() === sellerId.toString()
                );
                
                // Calculate new amount
                const newAmount = sellerProducts.reduce(
                    (sum, product) => sum + product.subAmount, 0
                );
                
                return {
                    ...order,
                    allProduct: sellerProducts,
                    amount: newAmount
                };
            });
            return res.json({ Orders: filteredOrders });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Server error" });
    }
  }

  async getOrderByUser(req, res) {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let Order = await orderModel
          .find({ user: uId })
          .populate("allProduct.id", "pName pImages pPrice")
          .populate("user", "name email")
          .sort({ _id: -1 });
        if (Order) {
          return res.json({ Order });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postCreateOrder(req, res) {
    let { allProduct, user, amount, razorpay_payment_id, razorpay_order_id, razorpay_signature, address, phone } = req.body;
  
    if (
      !allProduct ||
      !user ||
      !amount ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !address ||
      !phone
    ) {
      return res.json({ message: "All fields must be required" });
    }
  
    try {
      // Fetch product details for each product in the cart
      const updatedAllProduct = await Promise.all(
        allProduct.map(async (item) => {
          const product = await productModel.findById(item.id).select("pName pPrice pSeller");
          if (!product) {
            throw new Error(`Product with ID ${item.id} not found`);
          }
          return {
            id: item.id,
            name: product.pName,
            price: item.price,
            pSeller: product.pSeller,
            subAmount: item.price * item.quantitiy,
            quantitiy: item.quantitiy,
          };
        })
      );

      let newOrder = new orderModel({
        allProduct: updatedAllProduct,
        user,
        amount,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        address,
        phone,
      });
      
      let save = await newOrder.save();
      if (save) {
        const buyer = await userModel.findById(user).select("email name");
        const orderDate = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Generate plain text email content
        let emailText = `Thank you for your order!\n\n`;
        emailText += `Order #${save._id} has been confirmed\n`;
        emailText += `Order Date: ${orderDate}\n`;
        emailText += `Delivery Address: ${address}\n`;
        emailText += `Contact Phone: ${phone}\n\n`;
        
        emailText += `Your Items:\n`;
        emailText += `----------------------------------------\n`;
        updatedAllProduct.forEach(product => {
          emailText += `${product.name}\n`;
          emailText += `Price: ₹${product.price}\n`;
          emailText += `Quantity: ${product.quantitiy}\n`;
          emailText += `Subtotal: ₹${product.subAmount}\n\n`;
        });
        
        emailText += `----------------------------------------\n`;
        emailText += `Total Amount: ₹${amount}\n\n`;
        
        emailText += `If you have any questions, please contact our customer support.\n`;
        // Send email
        await sendEmail({ 
          email: buyer.email, 
          message: emailText, 
          subject: `Your SavarsPoint Order #${save._id} is confirmed`
        });

        return res.json({ success: "Order created successfully" });
      }
    } catch (error) {
      console.error(error);
      return res.json({ error: error.message || "Something went wrong" });
    }
}

  async postUpdateOrder(req, res) {
    let { oId, status } = req.body;
    if (!oId || !status) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentOrder = orderModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      currentOrder.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "Order updated successfully" });
      });
    }
  }

  async postDeleteOrder(req, res) {
    let { oId } = req.body;
    if (!oId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteOrder = await orderModel.findByIdAndDelete(oId);
        if (deleteOrder) {
          return res.json({ success: "Order deleted successfully" });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

const ordersController = new Order();
module.exports = ordersController;
