import { Router } from "express";
import { z } from "zod";
import { requireUser } from "../auth.js";
import { pool } from "../db.js";

const router = Router();
const idSchema = z.coerce.number().int().positive();
const tradeSchema = z.object({
  symbol: z.string().trim().min(3).max(24).transform((value) => value.toUpperCase()),
  direction: z.enum(["buy", "sell"]),
  entry_price: z.number().positive(),
  exit_price: z.number().positive().nullable(),
  stop_loss: z.number().positive().nullable(),
  take_profit: z.number().positive().nullable(),
  lot_size: z.number().positive().nullable(),
  risk_percent: z.number().min(0).max(100).nullable(),
  strategy: z.string().trim().max(120).nullable(),
  result: z.enum(["open", "win", "loss", "breakeven"]),
  notes: z.string().trim().max(5000).nullable(),
  opened_at: z.string().datetime({ offset: true }),
});

router.use(requireUser);

router.get("/", async (req, res, next) => {
  try {
    const [trades] = await pool.execute(
      `SELECT id, symbol, direction, entry_price, exit_price, stop_loss, take_profit,
              lot_size, risk_percent, strategy, result, notes, opened_at, closed_at, created_at
       FROM journal_trades WHERE user_id = ? ORDER BY opened_at DESC LIMIT 500`,
      [req.user.id],
    );
    res.json({ trades });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const parsed = tradeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the trade fields and try again." });
    return;
  }
  try {
    const trade = parsed.data;
    const closedAt = trade.result === "open" ? null : new Date();
    const [result] = await pool.execute(
      `INSERT INTO journal_trades
       (user_id, symbol, direction, entry_price, exit_price, stop_loss, take_profit,
        lot_size, risk_percent, strategy, result, notes, opened_at, closed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, trade.symbol, trade.direction, trade.entry_price, trade.exit_price,
        trade.stop_loss, trade.take_profit, trade.lot_size, trade.risk_percent,
        trade.strategy || null, trade.result, trade.notes || null,
        new Date(trade.opened_at), closedAt,
      ],
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) {
    res.status(400).json({ error: "A valid trade ID is required." });
    return;
  }
  try {
    const [result] = await pool.execute(
      "DELETE FROM journal_trades WHERE id = ? AND user_id = ?",
      [id.data, req.user.id],
    );
    if (!result.affectedRows) {
      res.status(404).json({ error: "Trade not found." });
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
