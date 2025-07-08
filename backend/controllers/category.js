const Category = require('../models/categoryModel');
require('dotenv').config();

exports.createCategory = async (event) => {
  try {
    const { name } = JSON.parse(event.body || '{}');
    if (!name) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Name is required' }) };
    }
    const existCategory = await Category.findOne({ name });
    if (existCategory) {
      return { statusCode: 400, body: JSON.stringify({ message: 'category already exists' }) };
    }
    const newCategory = await Category.create({ name });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: newCategory, message: 'Category created' }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 400, body: JSON.stringify({ message: error }) };
  }
};

exports.updateCategory = async (event) => {
  try {
    const { updatedName } = JSON.parse(event.body || '{}');
    const { categoryId } = event.pathParameters || {};
    if (!updatedName) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Name is required' }) };
    }
    const existCategory = await Category.findOne({ _id: categoryId });
    if (!existCategory) {
      return { statusCode: 400, body: JSON.stringify({ message: 'category doesn\'t exists' }) };
    }
    existCategory.name = updatedName;
    const updatedCategory = await existCategory.save();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: updatedCategory, message: 'Category updated' }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 400, body: JSON.stringify({ message: error }) };
  }
};

exports.deleteCategory = async (event) => {
  try {
    const { categoryId } = event.pathParameters || {};
    if (!categoryId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'ID is required' }) };
    }
    const existCategory = await Category.findOne({ _id: categoryId });
    if (!existCategory) {
      return { statusCode: 400, body: JSON.stringify({ message: 'category doesn\'t exists' }) };
    }
    await Category.deleteOne({ _id: categoryId });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Category deleted' }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 400, body: JSON.stringify({ message: error }) };
  }
};

exports.categoryList = async (event) => {
  try {
    const categories = await Category.find({});
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: categories }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 400, body: JSON.stringify({ message: error }) };
  }
};

exports.readCategory = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'ID is required' }) };
    }
    const existCategory = await Category.findOne({ _id: id });
    if (!existCategory) {
      return { statusCode: 400, body: JSON.stringify({ message: 'category doesn\'t exists' }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: existCategory }),
    };
  } catch (error) {
    console.log('Error:', error);
    return { statusCode: 400, body: JSON.stringify({ message: error }) };
  }
};