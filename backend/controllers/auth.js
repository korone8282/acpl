const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGen = require('otp-generator');
const OtpModel = require('../models/otpModel');
const VerfiyOtpModel = require('../models/verifyOtp');
require('dotenv').config();

exports.sendOtp = async (event) => {
  try {
    const { email } = JSON.parse(event.body || '{}');
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid info', success: false }) };
    }
    const otp = otpGen.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const entry = await OtpModel.create({ email: existUser.email, otp });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, entry, message: 'Otp Sent' }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 403, body: JSON.stringify({ success: false, message: 'error sending otp' }) };
  }
};

exports.sendVerifyOtp = async (event) => {
  try {
    const { email } = JSON.parse(event.body || '{}');
    const existUser = await User.findOne({ email });
    if (existUser) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Already Registered', success: false }) };
    }
    const otp = otpGen.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const entry = await VerfiyOtpModel.create({ email, otp });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, entry, message: 'Otp Sent' }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 403, body: JSON.stringify({ success: false, message: 'error sending verification otp' }) };
  }
};

exports.loginOtp = async (event) => {
  try {
    const { email, otp } = JSON.parse(event.body || '{}');
    const newOtp = otp ? otp.join('') : '';
    const existUser = await User.findOne({ email });
    const recentOtp = await OtpModel.findOne({ email }).sort({ createdAt: -1 }).limit(1);
    if (!recentOtp || !recentOtp.otp) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Otp not found', success: false }) };
    }
    if (recentOtp.otp !== newOtp) {
      return { statusCode: 400, body: JSON.stringify({ message: 'invalid Otp', success: false }) };
    }
    const token1 = jwt.sign(
      { email: existUser.email, id: existUser.id, isAdmin: existUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );
    const userObj = existUser.toObject();
    userObj.token = token1;
    userObj.password = ' ';
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, existUser: userObj, token1, message: 'logged in' }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 403, body: JSON.stringify({ success: false, message: 'error logging in' }) };
  }
};

exports.signup = async (event) => {
  try {
    const { fname, email, password, confirmPassword, otp } = JSON.parse(event.body || '{}');
    const newOtp = otp ? otp.join('') : '';
    if (!fname || !email || !password || !confirmPassword || !newOtp) {
      return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Fill all the fields' }) };
    }
    const existUser = await User.findOne({ email });
    if (existUser) {
      return { statusCode: 500, body: JSON.stringify({ success: false, data: 'User exists' }) };
    }
    if (password !== confirmPassword) {
      return { statusCode: 500, body: JSON.stringify({ success: false, data: "pass don't match" }) };
    }
    const recentOtp = await VerfiyOtpModel.findOne({ email }).sort({ createdAt: -1 }).limit(1);
    if (!recentOtp || !recentOtp.otp) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Otp not found', success: false }) };
    }
    if (recentOtp.otp !== newOtp) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid Otp', success: false }) };
    }
    const hashPass = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fname,
      email,
      password: hashPass,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${fname} ${fname}`,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: newUser, message: 'signup successful' }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, data: 'error' }) };
  }
};

exports.googleLogin = async (event) => {
  try {
    const { token } = JSON.parse(event.body || '{}');
    const { email, picture, name, jti } = jwt.decode(token, process.env.JWT_SECRET); // Note: JWT decode doesn't use secret for verification
    let existUser = await User.findOne({ email });
    if (!existUser) {
      const hashPass = await bcrypt.hash(jti, 10);
      const newUser = await User.create({
        fname: name,
        email,
        password: hashPass,
        image: `https://api.dicebear.com/7.x/initials/svg?seed=${name} ${name}`,
      });
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, data: newUser, message: 'signup successful' }),
      };
    } else {
      const token1 = jwt.sign(
        { email: existUser.email, id: existUser.id, isAdmin: existUser.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
      );
      const userObj = existUser.toObject();
      userObj.token = token1;
      userObj.password = ' ';
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, existUser: userObj, token1, message: 'logged in' }),
      };
    }
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, data: 'error' }) };
  }
};

exports.login = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) {
      return { statusCode: 500, body: JSON.stringify({ success: false, data: 'fill all fields' }) };
    }
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return { statusCode: 500, body: JSON.stringify({ success: false, data: 'no such user' }) };
    }
    if (await bcrypt.compare(password, existUser.password)) {
      const token = jwt.sign(
        { email: existUser.email, id: existUser.id, isAdmin: existUser.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
      );
      const userObj = existUser.toObject();
      userObj.token = token;
      userObj.password = ' ';
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, existUser: userObj, token, message: 'logged in' }),
      };
    } else {
      return { statusCode: 403, body: JSON.stringify({ success: false, message: 'wrong pass' }) };
    }
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, data: 'error' }) };
  }
};

exports.logout = async (event) => {
  try {
    // Note: Cookies are not directly manageable in Netlify Functions; return a response instead
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'logged out' }),
      headers: { 'Set-Cookie': 'cookie1=; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT' },
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, data: 'error' }) };
  }
};

exports.getAllUsers = async (event) => {
  try {
    const users = await User.find({});
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'success', users }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, data: 'error' }) };
  }
};

exports.getCurrentUser = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) {
      return { statusCode: 404, body: JSON.stringify({ success: false, data: 'no user exists' }) };
    }
    const user = await User.findById(id);
    if (!user) {
      return { statusCode: 404, body: JSON.stringify({ success: false, data: 'no user exists' }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: user }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, data: 'error' }) };
  }
};

exports.updateProfile = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const { fname, dob, gender, image, about } = JSON.parse(event.body || '{}');
    if (!id) {
      return { statusCode: 404, body: JSON.stringify({ success: false, data: 'no user exists' }) };
    }
    const user = await User.findById(id);
    if (!user) {
      return { statusCode: 404, body: JSON.stringify({ success: false, data: 'no user exists' }) };
    }
    user.fname = fname || user.fname;
    user.dob = dob || user.dob;
    user.gender = gender || user.gender;
    user.image = image || user.image;
    user.about = about || user.about;
    const updatedUser = await user.save();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'product successfully updated', updatedUser }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, data: 'error' }) };
  }
};

exports.deleteUser = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) {
      return { statusCode: 404, body: JSON.stringify({ success: false, data: 'no user exists' }) };
    }
    const user = await User.findById(id);
    if (!user) {
      return { statusCode: 404, body: JSON.stringify({ success: false, data: 'no user exists' }) };
    }
    if (user.isAdmin) {
      return { statusCode: 400, body: JSON.stringify({ message: "can't delete admin" }) };
    }
    await User.findOneAndDelete({ _id: id });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'successfully deleted' }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, data: 'error' }) };
  }
};

exports.userId = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) {
      return { statusCode: 404, body: JSON.stringify({ success: false, data: 'no user exists' }) };
    }
    const user = await User.findById(id).select('-password');
    if (!user) {
      return { statusCode: 404, body: JSON.stringify({ success: false, data: 'no user exists' }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, user }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false, data: 'error' }) };
  }
};