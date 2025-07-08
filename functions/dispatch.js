const {
    readDispatch,
    readPacked,
    updateData,
    readPackedReport,
    readDispatchedReport,
  } = require('../backend/controllers/dispatch');
  const { dbConnect } = require('../backend/config/connectDB');
  
  exports.handler = async (event, context) => {
    // Ensure MongoDB connection
    await dbConnect();
  
    // Extract path, method, body, and params
    const { httpMethod, path, body, pathParameters } = event;
    const { id } = pathParameters || {};
  
    try {
      switch (httpMethod) {
        case 'GET':
          if (path.endsWith('/dispatch')) return await readDispatch(event); // GET /dispatch
          if (path.endsWith('/packed')) return await readPacked(event); // GET /packed
          if (path.endsWith('/packed-report')) return await readPackedReport(event); // GET /packed-report
          if (path.endsWith('/dispatched-report')) return await readDispatchedReport(event); // GET /dispatched-report
          break;
  
        case 'PUT':
          if (path.endsWith('/data/:id')) return await updateData(event); // PUT /data/:id
          break;
  
        default:
          return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
      }
      return { statusCode: 404, body: JSON.stringify({ error: 'Endpoint not found' }) };
    } catch (error) {
      console.log('Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal server error' }),
      };
    }
  };