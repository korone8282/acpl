const {
    createProduct,
    updateProduct,
    deleteProduct,
    productList,
    readProduct,
    updateDispProduct,
    updatePouches,
    updaterOne,
  } = require('../backend/controllers/product');
  const { dbConnect } = require('../backend/config/connectDB');
  
  exports.handler = async (event, context) => {
    // Ensure MongoDB connection
    await dbConnect();
  
    // Extract path, method, body, and params
    const { httpMethod, path, body, pathParameters } = event;
    const { buyer, productId, id } = pathParameters || {};
  
    try {
      switch (httpMethod) {
        case 'POST':
          if (path.endsWith('/product/:buyer')) return await createProduct(event); // POST /product/:buyer
          break;
  
        case 'PUT':
          if (path.endsWith('/product/:productId')) return await updateProduct(event); // PUT /product/:productId
          if (path.endsWith('/disp-product/:id')) return await updateDispProduct(event); // PUT /disp-product/:id
          if (path.endsWith('/pouches/:id')) return await updatePouches(event); // PUT /pouches/:id
          if (path.endsWith('/updater-one')) return await updaterOne(event); // PUT /updater-one
          break;
  
        case 'DELETE':
          if (path.endsWith('/product/:productId')) return await deleteProduct(event); // DELETE /product/:productId
          break;
  
        case 'GET':
          if (path.endsWith('/products')) return await productList(event); // GET /products
          if (path.endsWith('/product/:id')) return await readProduct(event); // GET /product/:id
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