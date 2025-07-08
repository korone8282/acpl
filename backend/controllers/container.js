require('dotenv').config();
const Container = require('../models/containerModel');
const Data = require('../models/dataModel');

exports.createData = async (event) => {
  try {
    const arr = JSON.parse(event.body || '[]');
    const { name } = event.pathParameters || {};
    if (!arr.length) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Empty Entry Submitted' }) };
    }
    const newData = await Container.create({ name, list: arr });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: newData, message: 'Data created' }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.readData = async (event) => {
  try {
    const { start, end } = JSON.parse(event.body || '{}');
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    const existData = await Data.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    if (!existData.length) {
      return { statusCode: 404, body: JSON.stringify({ message: "Data doesn't exists" }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: existData }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.readExport = async (event) => {
  try {
    const { exportId } = event.pathParameters || {};
    const existExport = await Container.findOne({ _id: exportId });
    if (!existExport) {
      return { statusCode: 500, body: JSON.stringify({ message: "Export doesn't exists" }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: existExport }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.readAll = async (event) => {
  try {
    const existData = await Container.find({});
    if (!existData.length) {
      return { statusCode: 404, body: JSON.stringify({ message: "Data doesn't exists" }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: existData }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.deleteExport = async (event) => {
  try {
    const { exportId } = event.pathParameters || {};
    const existExport = await Container.findOne({ _id: exportId });
    if (!existExport) {
      return { statusCode: 500, body: JSON.stringify({ message: "Export doesn't exists" }) };
    }
    await Container.findOneAndDelete({ _id: exportId });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Container deleted' }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};