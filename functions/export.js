const {
    createData,
    readData,
    readExport,
    readAll,
    deleteExport,
  } = require('../backend/controllers/data');
  const { dbConnect } = require('../backend/config/connectDB');
  
  exports.handler = async (event, context) => {
    // Ensure MongoDB connection
    await dbConnect();
  
    // Extract path, method, body, and params
    const { httpMethod, path, body, pathParameters } = event;
    const { name, exportId } = pathParameters || {};
  
    try {
      switch (httpMethod) {
        case 'POST':
          if (path.endsWith('/data/:name')) return await createData(event); // POST /data/:name
          break;
  
        case 'GET':
          if (path.endsWith('/data')) return await readData(event); // GET /data (with start/end in body)
          if (path.endsWith('/export/:exportId')) return await readExport(event); // GET /export/:exportId
          if (path.endsWith('/all')) return await readAll(event); // GET /all
          break;
  
        case 'DELETE':
          if (path.endsWith('/export/:exportId')) return await deleteExport(event); // DELETE /export/:exportId
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