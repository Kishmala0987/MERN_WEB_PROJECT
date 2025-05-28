const { validationResult, check } = require("express-validator");
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken'); // Add this at the top


exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        errors: ['Invalid email or password']
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        errors: ['Invalid email or password']
      });
    }
    const token = jwt.sign(
      { 
        userId: user._id,
        userType: user.userType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
 res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        phone: user.phone,
        ...(user.userType === 'seller' && {
          shopName: user.shopName,
          businessAddress: user.businessAddress
        })
      }
    });


  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
        errors: ['Server error occurred during login']
    });
  }
};

exports.postLogout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
exports.getSignUp =(req, res, next) =>{
  res.render('auth/signup',{
    currentPage: 'Signup',
    pageTitle: 'SignUp',
    errors: [],
    oldInput: {firstName: "", lastName: "", userType: ""},
    isLoggedIn: false,
    user: {}
  });
}
//install express validator
//array of middlewares
exports.postSignUp = [
  check('firstName')
  .trim()
  .isLength({min: 2})
  .withMessage('First Name should be at least 2 characters long')
  .matches(/^[A-Za-z]+$/)
  .withMessage('First Name should only contain alphabets'),

  check('lastName')
  .matches(/^[A-Za-z]*$/)
  .withMessage('First Name should only contain alphabets'),

  check('email')
  .isEmail()
  .withMessage('Please enter a valid email')
  .normalizeEmail(),

  check('phone')
  .notEmpty()
  .withMessage('Please enter a valid phone number'),
  
  check('password')
  .isLength({min : 8})
  .withMessage('Password should be atleast 8 characters long')
  .matches(/[A-Z]/)
  .withMessage('Should contain atleast one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Should contain atleast one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Should contain atleast one number')
  .matches(/[!@$]/)
  .withMessage('Should contain atleast one speacial character')
  .trim(),

  check('confirmPassword')
  .trim()
  .custom((value, {req}) => {
    if(value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),

  check('userType')
  .notEmpty()
  .withMessage('Please select a user type')
  .isIn(['customer', 'seller', 'admin'])
  .withMessage('Invalid user type'),

  check('terms')
  .notEmpty()
  .withMessage('Please accept the terms and condition')
  .custom((value, {req}) => {
    if(value !== 'on'){
      throw new Error('Please accept the terms and conditions');
    }
    return true;
  }),
  async (req, res, next) =>{
    try{
       console.log('Request body:', {
        ...req.body,
      });

      const {firstName, lastName, email, password,userType,phone,shopName, businessAddress} = req.body;
    const error = validationResult(req);
    if(!error.isEmpty()){
      return res.status(422).json({
        success: false,
        errors:error.array().map(err => err.msg),
      })
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      userType
    }
    if(userType === 'seller'){
      if(!shopName || !businessAddress){
        return res.status(422).json({
          success: false,
          errors: ['Please provide shop name and business address'],
        })
      }
      userData.shopName = shopName;
      userData.businessAddress = businessAddress;
    }
    const user = new User(userData);
    await user.save();
    const token = jwt.sign(
      { 
        userId: user._id,
        userType: user.userType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(201).json({
      success: true,
      token,
      message: 'User registered successfully',
      user: {
        id: user._id,
        firstName,
        lastName,
        email,
        phone,
        ...(user.userType === 'seller' && {
            shopName: user.shopName,
            businessAddress: user.businessAddress
          })      
        }
    });
  }
  catch(err){
    console.error('signup error',err);
    res.status(500).json({
      success: false,
      errors: ['Server error occurred during registration']    
    });
  }
  }
];