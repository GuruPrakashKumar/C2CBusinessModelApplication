const Razorpay = require("razorpay");

class razorpay {
    async order(req, res) {
        console.log('excuting line 14')
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        console.log('amount: ', req.body);
        const options = {
            amount: req.body.amount,
            currency: "INR",
            receipt: "receipt#1",
        };
        try{
            const order = await instance.orders.create(options);
            // console.log(order)
            res.json({
                order_id: order.id,
                currency: "INR",
                amount: order.amount,
            });
        }catch(err){
            console.log(err);
        }
    }
    async paymentFetch(req, res) {
        const {paymentId} = req.params;
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        try{
            const payment = await instance.payments.fetch(paymentId);
            if(!payment){
                return res.status(500).json("Error at razorpay loading")
            }
            res.json({
                status: payment.status,
                method: payment.method,
                amount: payment.amount,
                currency: payment.currency,
            });
        }catch(err){
            console.log(err);
        }
    }
}

const razorpayController = new razorpay();
module.exports = razorpayController;
