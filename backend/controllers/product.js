require('dotenv').config();
const Product = require('../models/productModel');
const Dispatch = require('../models/dispatchModel');
const Data = require('../models/dataModel');

exports.createProduct = async (event) => {
  try {
    const { name } = JSON.parse(event.body || '{}');
    const { buyer } = event.pathParameters || {};
    if (!name || !buyer) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Name is required' }) };
    }
    const existProduct = await Product.find({ buyer, name });
    if (existProduct.length) {
      return { statusCode: 500, body: JSON.stringify({ message: 'Product already exists' }) };
    }
    const newProduct = await Product.create({ buyer, name });
    for (let i = 0; i < 12; i++) {
      newProduct.pouches.push({ month: i + 1, stock: 0, remain: 0 });
      newProduct.dispatched.push({ month: i + 1, dispatch: 0, balance: 0 });
    }
    await newProduct.save();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: newProduct, message: 'Product created' }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.updateProduct = async (event) => {
  try {
    const { updatedName } = JSON.parse(event.body || '{}');
    const { productId } = event.pathParameters || {};
    if (!updatedName) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Name is required' }) };
    }
    const existProduct = await Product.findOne({ _id: productId });
    if (!existProduct) {
      return { statusCode: 500, body: JSON.stringify({ message: "Product doesn't exists" }) };
    }
    existProduct.name = updatedName;
    const updatedProduct = await existProduct.save();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: updatedProduct, message: 'Category updated' }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.deleteProduct = async (event) => {
  try {
    const { productId } = event.pathParameters || {};
    const existProduct = await Product.findOne({ _id: productId });
    if (!existProduct) {
      return { statusCode: 500, body: JSON.stringify({ message: "category doesn't exists" }) };
    }
    await Product.findOneAndDelete({ _id: productId });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Product deleted' }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.productList = async (event) => {
  try {
    const products = await Product.find({});
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: products }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.readProduct = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const existProduct = await Product.findOne({ _id: id });
    if (!existProduct) {
      return { statusCode: 500, body: JSON.stringify({ message: "Product doesn't exists" }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: existProduct }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.updateDispProduct = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const { buyer, box, dispatched, issue, month, product } = JSON.parse(event.body || '{}');
    const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const startDate = new Date(`2025-${month}-01`);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(`2025-${month}-${days[month - 1]}`);
    endDate.setHours(23, 59, 59, 999);
    const existProduct = await Product.findOne({ _id: id });
    const existData = await Data.find({ createdAt: { $gte: startDate, $lte: endDate } });
    if (!existProduct) {
      return { statusCode: 500, body: JSON.stringify({ message: "Product doesn't exists" }) };
    }
    if (dispatched && issue && box) {
      existProduct.dispatched[month - 1].dispatch =
        parseInt(dispatched) + (existProduct.dispatched[month - 1].dispatch || 0);
      existProduct.dispatched[month - 1].balance = existData.reduce(
        (acc, obj) =>
          acc +
          obj.dataList
            .filter((item) => item.productName === product && item.buyerName === buyer)
            .reduce((accumulator, obj) => accumulator + obj.pouchPacked, 0),
        0
      ) - existProduct.dispatched[month - 1].dispatch;
      await Dispatch.create({
        buyerName: buyer,
        productName: existProduct.name,
        pouchDispatched: dispatched,
        box,
        lDate: issue,
      });
      await existProduct.save();
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'updateDispProduct' }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.updatePouches = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const { buyer, pouches, month, product } = JSON.parse(event.body || '{}');
    const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const startDate = new Date(`2025-${month}-01`);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(`2025-${month}-${days[month - 1]}`);
    endDate.setHours(23, 59, 59, 999);
    const existProduct = await Product.findOne({ _id: id });
    const existData = await Data.find({ createdAt: { $gte: startDate, $lte: endDate } });
    if (!existProduct || !pouches) {
      return { statusCode: 500, body: JSON.stringify({ message: "Product doesn't exists" }) };
    }
    existProduct.pouches[month - 1].stock =
      parseInt(pouches) + (existProduct.pouches[month - 1].stock || 0);
    existProduct.pouches[month - 1].remain =
      existProduct.pouches[month - 1].stock -
      (existData.reduce(
        (acc, obj) =>
          acc +
          obj.dataList
            .filter((item) => item.productName === product && item.buyerName === buyer)
            .reduce((accumulator, obj) => accumulator + obj.pouchQuantity, 0),
        0
      ) +
        existData.reduce(
          (acc, obj) =>
            acc +
            obj.dataList
              .filter((item) => item.productName === product && item.buyerName === buyer)
              .reduce((accumulator, obj) => accumulator + obj.empty, 0),
          0
        ));
    await existProduct.save();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

exports.updaterOne = async (event) => {
  try {
    const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const existProduct = await Product.find({});
    for (let i = 1; i < 13; i++) {
      const startDate = new Date(`2025-${i}-01`);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(`2025-${i}-${days[i - 1]}`);
      endDate.setHours(23, 59, 59, 999);
      const existData = await Data.find({ createdAt: { $gte: startDate, $lte: endDate } });
      for (let index = 0; index < existProduct.length; index++) {
        const newProduct = existProduct[index];
        newProduct.dispatched[i - 1].balance = existData.reduce(
          (acc, obj) =>
            acc +
            obj.dataList
              .filter((item) => item.productName === newProduct.name && item.buyerName === newProduct.buyer)
              .reduce((accumulator, obj) => accumulator + obj.pouchPacked, 0),
          0
        ) - (newProduct.dispatched[i - 1].dispatch || 0);
        newProduct.pouches[i - 1].remain =
          (newProduct.pouches[i - 1].stock || 0) -
          (existData.reduce(
            (acc, obj) =>
              acc +
              obj.dataList
                .filter((item) => item.productName === newProduct.name && item.buyerName === newProduct.buyer)
                .reduce((accumulator, obj) => accumulator + obj.pouchQuantity, 0),
            0
          ) +
            existData.reduce(
              (acc, obj) =>
                acc +
                obj.dataList
                  .filter((item) => item.productName === newProduct.name && item.buyerName === newProduct.buyer)
                  .reduce((accumulator, obj) => accumulator + obj.empty, 0),
              0
            ));
        await newProduct.save();
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};