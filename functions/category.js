const { createCategory, updateCategory, deleteCategory, categoryList, readCategory } = require('../backend/controllers/category');
const { dbConnect } = require('../backend/config/connectDB');

exports.handler = async (event, context) => {
  // Ensure MongoDB connection
  await dbConnect();

  // Extract path and method
  const { httpMethod, path, queryStringParameters, body, pathParameters } = event;
  const id = pathParameters?.id || queryStringParameters?.id;

  try {
    switch (httpMethod) {
      case 'POST':
        if (!path.endsWith('/')) {
          return await updateCategory(event); // POST /:categoryId
        }
        return await createCategory(event); // POST /

      case 'DELETE':
        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'ID is required' }) };
        }
        return await deleteCategory(event); // DELETE /:categoryId

      case 'GET':
        if (path.endsWith('/categories')) {
          return await categoryList(event); // GET /categories
        }
        if (id) {
          return await readCategory(event); // GET /:id
        }
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid path' }) };

      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }
  } catch (error) {
    console.log('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
  };
  }
};