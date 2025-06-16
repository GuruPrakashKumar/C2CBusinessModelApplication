const { toTitleCase, validateEmail } = require("../config/function");
const bcrypt = require("bcryptjs");
const userModel = require("../models/users");
const sendEmail = require('../utils/sendEmail')
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { JWT_SECRET } = require("../config/keys");

class Auth {
  async isAdmin(req, res) {
    let { loggedInUserId } = req.body;
    try {
      let loggedInUserRole = await userModel.findById(loggedInUserId);
      res.json({ role: loggedInUserRole.userRole });
    } catch {
      res.status(404);
    }
  }

  async allUser(req, res) {
    try {
      let allUser = await userModel.find({});
      res.json({ users: allUser });
    } catch {
      res.status(404);
    }
  }

  /* User Registration/Signup controller  */
  async postSignup(req, res) {
    let { name, password, cPassword, phone, address, userRole } = req.body;
    console.log('req.body : ', req.body);
    let error = {};
    if (!name || !password || !cPassword) {
      error = {
        ...error,
        name: "Filed must not be empty",
        password: "Filed must not be empty",
        cPassword: "Filed must not be empty",
      };
      return res.json({ error });
    }
    if (name.length < 3 || name.length > 25) {
      error = { ...error, name: "Name must be 3-25 charecter" };
      return res.json({ error });
    } else {
      name = toTitleCase(name);
      if ((password.length > 255) | (password.length < 8)) {
        error = {
          ...error,
          password: "Password must be 8 charecter",
          name: "",
          email: "",
        };
        return res.json({ error });
      } else {
        // If Email & Number exists in Database then:
        try {
          const hashedPassword = bcrypt.hashSync(password, 10);
          console.log('req.userDetails._id: ', req.userDetails._id)
          const newUser = await userModel.findOne({_id: req.userDetails._id});
          console.log('newUser: ', newUser)
          if (newUser==null) {
            return res.status(404).json({ message: 'User Not Found' });
          }else if(newUser.verified ==false){
            return res.status(401).json({ message: 'User not verified' });
          }else if(newUser.password !=null){
            return res.status(409).json({ message: 'Account already exists' });
          }
          const data = {
            name: toTitleCase(name), 
            password: hashedPassword, 
            userRole: userRole,
          }
          if(phone) {data.phoneNumber = phone};
          if(address) {data.address = address};
          console.log('data: ', data)
          await newUser.updateOne(data);
          // ========= Here role 1 for admin signup role 0 for customer signup =========
          //FOR CHANGE ROLE: for admin: 1   for user: 0
          res.status(200).json({ message: "Account Registered successfully" });
          
        } catch (err) {
          console.log(err);
          res.status(500).json(err);
        }
      }
    }
  }

  async signUpInit(req, res) {
    const email = req.body.email;
    if (validateEmail(email)) {
      const existingUser = await userModel.findOne({ email: req.body.email });
      const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
      const timestamp = Date.now() + 10 * 60 * 1000 //otp expire time 10 mins
      const text = `Your OTP: ${otp}\nDon't Share this otp with anyone else.\nIf you have not generated this OTP you can safely ignore this.`
      if (existingUser != null && existingUser.password != null) {
        res.status(409).json({ message: "Account already exists" });
      } else if (existingUser != null) {
        // User exists in database, update OTP and timestamp
        await existingUser.updateOne({ $set: { emailOtpExpire: timestamp, emailOtp: otp } })
        // Sending OTP via email
        await sendEmail({ email: email, message: text, subject: 'Email Verification' })
        res.status(200).json({ message: "OTP sent to the user's email." })
      } else {
        // User doesn't exist in database, create a new user  
        const newUser = new userModel({
          email: email,
          emailOtp: otp,
          emailOtpExpire: timestamp
        })
        await newUser.save()
        // Sending OTP via email  //UNCOMMENT THESE LINES TO SEND THE OTP TO THE RESPECTIVE EMAIL
        await sendEmail({ email: email, message: text, subject: 'Email Verification' })
        res.status(200).json({ message: "OTP sent to the user's email." })

      }
    } else {
      res.status(400).json({ message: "Invalid email" })
    }
  }

  async otpVerification(req, res) {//requires email and otp
    const savedUser = await userModel.findOne({ email: req.body.email });
    if (savedUser != null) {
      const savedOtp = savedUser.emailOtp;
      if (savedOtp === null) {
        res.status(403).json({ message: "Regenerate OTP" });
      } else if (savedOtp != req.body.otp) {//saved otp and user provided otp is not equal
        res.status(400).json({ message: "Incorrect OTP !!" })
      } else {
        const currentTimeStamp = Date.now();
        if (currentTimeStamp > savedUser.emailOtpExpire) {
          res.status(410).json({ message: "OTP has expired" })
        } else {
          await savedUser.updateOne({ $set: { verified: true, emailOtp: null, emailOtpExpire: null } })
          jwt.sign({ _id: savedUser._id }, JWT_SECRET, { expiresIn: "300s" }, (err, token) => {//TODO: change this expire time
            if (err) {
              res.status(500).json({ message: "Internal Server Error" });
            }
            res.status(200).json({ accessToken: token });
          });
        }
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  }



  /* User Login/Signin controller  */
  async postSignin(req, res) {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        error: "Fields must not be empty",
      });
    }
    try {
      const data = await userModel.findOne({ email: email });
      if (!data || !data.password) {
        return res.json({
          error: "Invalid email or password",
        });
      } else {
        const login = await bcrypt.compare(password, data.password);
        if (login) {
          const token = jwt.sign(
            { _id: data._id, role: data.userRole },
            JWT_SECRET
          );
          const encode = jwt.verify(token, JWT_SECRET);
          return res.json({
            token: token,
            user: encode,
          });
        } else {
          return res.json({
            error: "Invalid email or password",
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  async forgotPassInit(req, res){
    if(!req.body.email){
      return res.json({
        error: "Field must not be empty",
      })
    }
    
    // add try catch block
    if(validateEmail(req.body.email)){
      const existingUser = await userModel.findOne({ email: req.body.email })
      if (existingUser != null && existingUser.password != null) {
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        const text = `Your OTP: ${otp}\nDon't Share this otp with anyone else.\nIf you have not generated this OTP you can safely ignore this.`
        const timestamp = Date.now() + 5 * 60 * 1000 //otp expire time 5 mins
        sendEmail({ email: existingUser.email, message: text, subject: 'Password Reset' })
        await existingUser.updateOne({ $set: { emailOtp: otp, emailOtpExpire: timestamp } })
        res.status(200).json({ message: "OTP sent to the user's email" })
      } else {
        res.status(404).json({ message: "User Not Found" })
      }
    }else{
      return res.json({
        error: "Invalid email or password",
      });
    }
  }

  //after otp verification
  async resetPassword(req, res){
    let {password, cPassword} = req.body;
    if(!password || !cPassword){
      return res.json({
        error: "Field must not be empty",
      })
    }
    if ((password.length > 255) | (password.length < 8)) {
      return res.json({
        error: "Password should be greater than 8 character"
      })
    }
    password = bcrypt.hashSync(password, 10);
    const savedUser = await userModel.findOne({ _id: req.userDetails._id })
    if (savedUser.password != null) {
      await savedUser.updateOne({ $set: { password: password } })
      res.status(200).json({ message: "Password reset Successfully" })
    }else{
      res.status(400).json({ message: "You can not reset your password" })
    }
  }

}

const authController = new Auth();
module.exports = authController;
