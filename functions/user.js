const {
    sendOtp,
    sendVerifyOtp,
    loginOtp,
    signup,
    googleLogin,
    login,
    logout,
    getAllUsers,
    getCurrentUser,
    updateProfile,
    deleteUser,
    userId,
  } = require('../backend/controllers/auth');
  const { dbConnect } = require('../backend/config/connectDB');
  const jwt = require('jsonwebtoken');
  
  exports.handler = async (event, context) => {
    // Ensure MongoDB connection
    await dbConnect();
  
    // Extract path, method, and body
    const { httpMethod, path, body, pathParameters } = event;
    const id = pathParameters?.id;
  
    // Authorization middleware logic
    const authorization = async () => {
      const token = event.headers.authorization?.split(' ')[1];
      if (!token) {
        return { statusCode: 401, body: JSON.stringify({ success: false, message: 'Unauthorized' }) };
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
      } catch (error) {
        return { statusCode: 401, body: JSON.stringify({ success: false, message: 'Invalid token' }) };
      }
    };
  
    // authAdmin middleware logic
    const authAdmin = async (decoded) => {
      if (!decoded.isAdmin) {
        return { statusCode: 403, body: JSON.stringify({ success: false, message: 'Admin access required' }) };
      }
      return true;
    };
  
    // Apply middleware based on route
    let decodedToken = null;
    if (['PUT', 'DELETE', 'GET'].includes(httpMethod) && !path.endsWith('/send-otp') && !path.endsWith('/send-verify-otp') && !path.endsWith('/login-otp') && !path.endsWith('/signup') && !path.endsWith('/google-login') && !path.endsWith('/login')) {
      const authResult = await authorization();
      if (authResult.statusCode) return authResult;
      decodedToken = authResult;
      if (path.endsWith('/users') || path.endsWith('/user') || path.endsWith('/delete-user')) {
        const adminResult = await authAdmin(decodedToken);
        if (adminResult.statusCode) return adminResult;
      }
    }
  
    try {
      switch (httpMethod) {
        case 'POST':
          if (path.endsWith('/send-otp')) return await sendOtp(event);
          if (path.endsWith('/send-verify-otp')) return await sendVerifyOtp(event);
          if (path.endsWith('/login-otp')) return await loginOtp(event);
          if (path.endsWith('/signup')) return await signup(event);
          if (path.endsWith('/google-login')) return await googleLogin(event);
          if (path.endsWith('/login')) return await login(event);
          if (path.endsWith('/logout')) return await logout(event);
          break;
  
        case 'GET':
          if (path.endsWith('/users')) return await getAllUsers(event); // Requires admin
          if (path.endsWith('/current-user')) return await getCurrentUser(event);
          if (path.endsWith('/user/:id')) return await userId(event);
          break;
  
        case 'PUT':
          if (path.endsWith('/profile')) return await updateProfile(event); // Requires auth
          break;
  
        case 'DELETE':
          if (path.endsWith('/user')) return await deleteUser(event); // Requires admin
          break;
  
        default:
          return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
      }
      return { statusCode: 404, body: JSON.stringify({ error: 'Endpoint not found' }) };
    } catch (error) {
      console.log('Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: 'Internal server error' }),
      };
    }
  };