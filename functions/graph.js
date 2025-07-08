const { readGraph, monthlyGraph } = require('../backend/controllers/graph');
const { dbConnect } = require('../backend/config/connectDB');

exports.handler = async (event, context) => {
  // Ensure MongoDB connection
  await dbConnect();

  // Extract path, method, and params
  const { httpMethod, path, pathParameters } = event;
  const { month } = pathParameters || {};

  try {
    switch (httpMethod) {
      case 'GET':
        if (path.endsWith('/graph/:month')) return await readGraph(event); // GET /graph/:month
        if (path.endsWith('/monthly-graph')) return await monthlyGraph(event); // GET /monthly-graph
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