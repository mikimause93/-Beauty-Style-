const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

/**
 * GET /api/wallet
 * Get wallet balance and bank accounts for user.
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { bankAccounts: true },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
        include: { bankAccounts: true },
      });
    }

    res.json({ wallet });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/wallet/bank-account
 * Link a bank account (IBAN).
 */
router.post(
  '/bank-account',
  [
    body('iban').notEmpty().withMessage('IBAN is required'),
    body('accountName').notEmpty().withMessage('Account name is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { iban, bic, accountName, isDefault } = req.body;

      // Get or create wallet
      let wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await prisma.wallet.create({ data: { userId } });
      }

      // Validate IBAN format (basic)
      const ibanClean = iban.replace(/\s/g, '').toUpperCase();
      if (!/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/.test(ibanClean)) {
        return res.status(400).json({ error: 'Invalid IBAN format' });
      }

      const bankAccount = await prisma.bankAccount.create({
        data: {
          walletId: wallet.id,
          iban: ibanClean,
          bic,
          accountName,
          isDefault: isDefault || false,
        },
      });

      // If set as default, unset others
      if (isDefault) {
        await prisma.bankAccount.updateMany({
          where: { walletId: wallet.id, id: { not: bankAccount.id } },
          data: { isDefault: false },
        });
      }

      res.status(201).json({ bankAccount });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/wallet/bank-account/:id
 */
router.delete('/bank-account/:id', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    await prisma.bankAccount.deleteMany({
      where: { id: req.params.id, walletId: wallet.id },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
