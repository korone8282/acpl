require('dotenv').config();
const Goal = require('../models/goalModel');

exports.createGoal = async (event) => {
  try {
    const {
      buyerName,
      fname,
      batchNum,
      pouchSize,
      pouchGoal,
      day,
      date,
    } = JSON.parse(event.body || '{}');
    if (!buyerName || !fname || !batchNum || !pouchSize || !pouchGoal || !date || !day) {
      return { statusCode: 500, body: JSON.stringify({ message: 'Fill All Blanks' }) };
    }
    const newDate = new Date(date);
    const newGoal = await Goal.create({
      buyerName,
      fname,
      batchNum,
      pouchSize,
      pouchGoal,
      pouchPacked: 0,
      day,
      createdAt: newDate,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: newGoal, message: 'Goal created' }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.updateGoal = async (event) => {
  try {
    const {
      buyerName,
      fname,
      batchNum,
      pouchSize,
      pouchGoal,
      pouchPacked,
      day,
    } = JSON.parse(event.body || '{}');
    const { goalId } = event.pathParameters || {};
    const existGoal = await Goal.findOne({ _id: goalId });
    if (!existGoal) {
      return { statusCode: 500, body: JSON.stringify({ message: "Goal doesn't exists" }) };
    }
    existGoal.buyerName = buyerName || existGoal.buyerName;
    existGoal.fname = fname || existGoal.fname;
    existGoal.batchNum = batchNum || existGoal.batchNum;
    existGoal.pouchSize = pouchSize || existGoal.pouchSize;
    existGoal.pouchGoal = pouchGoal || existGoal.pouchGoal;
    existGoal.pouchPacked = pouchPacked || existGoal.pouchPacked;
    existGoal.day = day || existGoal.day;
    const updatedGoal = await existGoal.save();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: updatedGoal, message: 'Goal updated' }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.deleteGoal = async (event) => {
  try {
    const { goalId } = event.pathParameters || {};
    const existGoal = await Goal.findOne({ _id: goalId });
    if (!existGoal) {
      return { statusCode: 500, body: JSON.stringify({ message: "goal doesn't exists" }) };
    }
    await Goal.findOneAndDelete({ _id: goalId });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Goal deleted' }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.goalList = async (event) => {
  try {
    const { date } = event.pathParameters || {};
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    const existData = await Goal.find({ createdAt: { $gte: startDate, $lte: endDate } });
    if (!existData.length) {
      return { statusCode: 404, body: JSON.stringify({ message: "data doesn't exists" }) };
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