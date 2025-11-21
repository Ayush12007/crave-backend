import Order from '../models/Order.js';

// Configurable constants
const AVERAGE_PREP_TIME_MINS = 10; // Base time per order if specific item times aren't set
const ACTIVE_CHEFS = 3; // This could eventually be dynamic based on staff login

/**
 * Calculates the estimated time (in Date object) when a new order will be ready.
 * Logic: Base Time + (Queue Backlog / Number of Chefs)
 */
export const calculateEstimatedPickupTime = async (newOrderItemsCount) => {
  // 1. Get all orders currently in the kitchen
  const activeOrders = await Order.find({ status: 'Preparing' });

  // 2. Calculate total items in queue
  let totalItemsInQueue = 0;
  activeOrders.forEach(order => {
    order.items.forEach(item => {
      totalItemsInQueue += item.quantity;
    });
  });

  // 3. Add the new order's items to the calculation
  const totalLoad = totalItemsInQueue + newOrderItemsCount;

  // 4. Calculate delay: (Total Items * Avg Prep Time) / Active Chefs
  // We divide by chefs because they work in parallel.
  const estimatedMinutes = Math.ceil((totalLoad * AVERAGE_PREP_TIME_MINS) / ACTIVE_CHEFS);

  // 5. Add to current time
  const pickupTime = new Date();
  pickupTime.setMinutes(pickupTime.getMinutes() + estimatedMinutes);

  return pickupTime;
};