require('dotenv').config();
const Data = require('../models/dataModel');

exports.readGraph = async (event) => {
  try {
    const { month } = event.pathParameters || {};
    const arr = [];
    let flag = 0;

    for (let i = 1; i < 32; i++) {
      const start = new Date(`2025-${month}-${i}`);
      start.setHours(0, 0, 0, 0);
      const end = new Date(`2025-${month}-${i}`);
      end.setHours(23, 59, 59, 999);
      const existData = await Data.find({ createdAt: { $gte: start, $lte: end } });
      existData.length ? (arr.push(existData), flag = 1) : arr.push([]);
    }

    if (!flag) {
      return { statusCode: 404, body: JSON.stringify({ message: "data doesn't exists" }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: arr }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.monthlyGraph = async (event) => {
  try {
    const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const arr = [];
    let flag = 0;

    for (let i = 1; i < 13; i++) {
      const startDate = new Date(`2025-${i}-01`);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(`2025-${i}-${days[i - 1]}`);
      endDate.setHours(23, 59, 59, 999);
      const existData = await Data.find({ createdAt: { $gte: startDate, $lte: endDate } });
      existData.length ? (arr.push(existData), flag = 1) : arr.push([]);
    }

    if (!flag) {
      return { statusCode: 404, body: JSON.stringify({ message: "data doesn't exists" }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: arr }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};