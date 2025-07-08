const {
    createData,
    readData,
    deleteData,
    readBuyerData,
    readMonthlyData,
    readDvN,
    readKvF,
    ProductData,
    readLeft,
  } = require('../backend/controllers/data');
  const { dbConnect } = require('../backend/config/connectDB');
  
  exports.handler = async (event, context) => {
    // Ensure MongoDB connection
    await dbConnect();
  
    // Extract path, method, body, and params
    const { httpMethod, path, body, pathParameters } = event;
    const { string, dayTime, date, month, id } = pathParameters || {};
  
    try {
      switch (httpMethod) {
        case 'POST':
          if (path.endsWith('/data/:string/:dayTime')) return await createData(event); // POST /data/:string/:dayTime
          break;
  
        case 'GET':
          if (path.endsWith('/data/:date/:month')) return await readData(event); // GET /data/:date/:month
          if (path.endsWith('/buyer-data')) return await readBuyerData(event); // GET /buyer-data (with start/end/buyer in body)
          if (path.endsWith('/monthly/:month')) return await readMonthlyData(event); // GET /monthly/:month
          if (path.endsWith('/dvn')) return await readDvN(event); // GET /dvn (with start/end in body)
          if (path.endsWith('/kvf')) return await readKvF(event); // GET /kvf (with datey in body)
          if (path.endsWith('/product-data')) return await ProductData(event); // GET /product-data (with start/end/product in body)
          if (path.endsWith('/left')) return await readLeft(event); // GET /left
          break;
  
        case 'DELETE':
          if (path.endsWith('/data/:id')) return await deleteData(event); // DELETE /data/:id
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