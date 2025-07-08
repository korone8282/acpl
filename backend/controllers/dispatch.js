require('dotenv').config();
const Packed = require('../models/packedModel');
const Data = require('../models/dataModel');
const Dispatch = require('../models/dispatchModel');

exports.readDispatch = async (event) => {
  try {
    const existData = await Dispatch.find({}).sort({ lDate: -1 });
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

exports.readPacked = async (event) => {
  try {
    const existData = await Packed.find({});
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

exports.updateData = async (event) => {
  try {
    const { filling, i, product, id, packed, box, issue, element } = JSON.parse(event.body || '{}');
    const { id: paramId } = event.pathParameters || {};
    const data = await Data.findById(paramId || id);
    if (!data) {
      return { statusCode: 404, body: JSON.stringify({ success: false, data: 'no data exists' }) };
    }
    const index = data.dataList.findIndex(
      (obj) => obj.buyerName === element.buyerName && obj.productName === element.productName && obj.batch === element.batch
    );
    data.dataList[index].pouchQuantity = filling || data.dataList[index].pouchQuantity;
    if (packed && issue && box) {
      data.dataList[index].pouchPerCycle = parseInt(packed) + (data.dataList[index].pouchPerCycle || 0);
      data.dataList[index].retortCycle = parseInt(box) + (data.dataList[index].retortCycle || 0);
      await Packed.create({
        buyerName: data.dataList[index].buyerName,
        productName: data.dataList[index].productName,
        batch: data.dataList[index].batch,
        packSize: data.dataList[index].packSize,
        pouchPacked: packed,
        box,
        lDate: issue,
      });
    }
    const updatedData = await data.save();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: updatedData, message: 'data successfully updated' }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, body: JSON.stringify({ success: false, data: error.message }) };
  }
};

exports.readPackedReport = async (event) => {
  try {
    const { start, end } = JSON.parse(event.body || '{}');
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    const existData = await Packed.find({ lDate: { $gte: startDate, $lte: endDate } });
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

exports.readDispatchedReport = async (event) => {
  try {
    const { start, end } = JSON.parse(event.body || '{}');
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    const existData = await Dispatch.find({ lDate: { $gte: startDate, $lte: endDate } }).sort({ lDate: -1 });
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