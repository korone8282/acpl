const {
    createGoal,
    updateGoal,
    deleteGoal,
    goalList,
  } = require('../backend/controllers/goal');
  const { dbConnect } = require('../backend/config/connectDB');
  
  exports.handler = async (event, context) => {
    // Ensure MongoDB connection
    await dbConnect();
  
    // Extract path, method, body, and params
    const { httpMethod, path, body, pathParameters } = event;
    const { goalId, date } = pathParameters || {};
  
    try {
      switch (httpMethod) {
        case 'POST':
          if (path.endsWith('/goal')) return await createGoal(event); // POST /goal
          break;
  
        case 'PUT':
          if (path.endsWith('/goal/:goalId')) return await updateGoal(event); // PUT /goal/:goalId
          break;
  
        case 'DELETE':
          if (path.endsWith('/goal/:goalId')) return await deleteGoal(event); // DELETE /goal/:goalId
          break;
  
        case 'GET':
          if (path.endsWith('/goals/:date')) return await goalList(event); // GET /goals/:date
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