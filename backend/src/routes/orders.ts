import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { stripe } from '../utils/stripe';

const router = Router();
const prisma = new PrismaClient();

// Create order
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        totalAmount: parseFloat(totalAmount),
        status: 'PENDING',
        shippingAddress: {
          create: shippingAddress,
        },
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get user orders
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.params.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

export default router; 