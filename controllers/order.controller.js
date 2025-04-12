import Order from '../models/order.model.js';

export const placeOrder = async (req, res) => {
  try {
    const { cafeId, tableId, customer, orderList, cookingRequest } = req.body;
    const updatedOrderList = orderList.map((item) => {
      const {
        dishName,
        dishCategory,
        quantity,
        dishPrice,
        dishVariants,
        dishAddOns,
      } = item;

      const variantPrice = dishVariants?.variantPrice || 0;
      const addonPrice = dishAddOns
        ? dishAddOns.reduce((sum, addon) => sum + (addon.addOnPrice || 0), 0)
        : 0;

      const itemPrice = (dishPrice || 0 + variantPrice + addonPrice) * quantity;

      return {
        dishName,
        dishCategory,
        quantity,
        dishPrice,
        dishVariants,
        dishAddOns,
        price: itemPrice,
        status: 'pending',
      };
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingOrder = await Order.findOne({
      cafeId,
      tableId,
      customer,
      'orderList.status': { $in: ['pending', 'preparing'] },
      createdAt: { $gte: today },
    });

    if (existingOrder) {
      const newItemsTotal = updatedOrderList.reduce(
        (acc, item) => acc + item.price,
        0
      );

      existingOrder.orderList = [
        ...existingOrder.orderList,
        ...updatedOrderList,
      ];
      existingOrder.totalPrice += newItemsTotal;

      if (cookingRequest) {
        existingOrder.cookingRequest = existingOrder.cookingRequest
          ? `${existingOrder.cookingRequest}. NEW REQUEST: ${cookingRequest}`
          : cookingRequest;
      }

      await existingOrder.save();

      return res.status(200).json({
        success: true,
        message: 'Added to existing order',
        order: existingOrder,
      });
    } else {
      const totalPrice = updatedOrderList.reduce(
        (acc, item) => acc + item.price,
        0
      );

      const newOrder = new Order({
        cafeId,
        tableId,
        customer,
        orderList: updatedOrderList,
        totalPrice,
        cookingRequest,
      });

      await newOrder.save();

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order: newOrder,
      });
    }
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({
      success: false,
      message: 'Error placing order. Please try again later.',
    });
  }
};

export const getOrders = async (req, res) => {
  const { cafeId } = req.params;

  try {
    const orders = await Order.find({ cafeId });

    res.status(200).json(orders.length > 0 ? orders : []);  
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


export const deleteOrder = async (req, res) => {
  const { cafeId, tableId } = req.body;

  try {
    const orderToDelete = await Order.findOneAndDelete({
      cafeId,
      tableId,
    });

    if (!orderToDelete) {
      return res.status(404).json({ message: 'table not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
  }
};

export const updateItemQuantity = async (req, res) => {
  const { orderId, itemIndex, newQuantity, newPrice } = req.body;

  if (!orderId || itemIndex === undefined || !newQuantity) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing required fields' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    if (itemIndex < 0 || itemIndex >= order.orderList.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid item index' });
    }

    const oldPrice = order.orderList[itemIndex].price;

    order.orderList[itemIndex].quantity = newQuantity;
    order.orderList[itemIndex].price =
      newPrice ||
      (order.orderList[itemIndex].price / order.orderList[itemIndex].quantity) *
        newQuantity;

    order.totalPrice =
      order.totalPrice - oldPrice + order.orderList[itemIndex].price;

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Item quantity updated',
      order,
    });
  } catch (error) {
    console.error('Error updating item quantity:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update order item status
export const updateItemStatus = async (req, res) => {
  const { orderId, itemIndex, newStatus } = req.body;

  if (!orderId || itemIndex === undefined || !newStatus) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing required fields' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    if (itemIndex < 0 || itemIndex >= order.orderList.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid item index' });
    }

    order.orderList[itemIndex].status = newStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Item status updated',
      order,
    });
  } catch (error) {
    console.error('Error updating item status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Remove an item from order
export const removeItem = async (req, res) => {
  const { orderId, itemIndex } = req.body;

  if (!orderId || itemIndex === undefined) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing required fields' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    if (itemIndex < 0 || itemIndex >= order.orderList.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid item index' });
    }
    const removedItemPrice = order.orderList[itemIndex].price;
    order.orderList.splice(itemIndex, 1);
    order.totalPrice -= removedItemPrice;
    if (order.orderList.length === 0) {
      await Order.findByIdAndDelete(orderId);

      return res.status(200).json({
        success: true,
        message: 'Order removed as it had no items left',
      });
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Item removed',
      order,
    });
  } catch (error) {
    console.error('Error removing item:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Remove addon from an item
export const removeAddon = async (req, res) => {
  try {
    const { orderId, itemIndex, addonIndex } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    if (itemIndex < 0 || itemIndex >= order.orderList.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid item index' });
    }

    const item = order.orderList[itemIndex];

    if (addonIndex < 0 || addonIndex >= item.dishAddOns.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid addon index' });
    }
    const addonPrice = item.dishAddOns[addonIndex].addOnPrice;
    const addon = item.dishAddOns.splice(addonIndex, 1)[0];
    item.price -= addonPrice * item.quantity;
    order.totalPrice -= addonPrice * item.quantity;

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Addon ${addon.addOnName} removed from ${item.dishName}`,
      order,
    });
  } catch (error) {
    console.error('Error removing addon:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Error removing addon' });
  }
};
