import { Router } from "express";
import History from "../models/History.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// All history routes require auth
router.use(protect);

// ── POST /api/history  (save / upsert a paper) ───────────────────────────────
router.post("/", async (req, res) => {
  const { paper_id, title, num_chunks, message } = req.body;

  if (!paper_id || !title)
    return res.status(400).json({ detail: "paper_id and title are required" });

  try {
    const item = await History.findOneAndUpdate(
      { user_id: req.user._id, paper_id },
      { user_id: req.user._id, paper_id, title, num_chunks, message },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ status: "saved", item });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ── GET /api/history  (all papers for current user, newest first) ────────────
router.get("/", async (req, res) => {
  try {
    const history = await History.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Rename _id → id and format dates for frontend
    const formatted = history.map(({ _id, __v, ...rest }) => ({
      id: _id,
      ...rest,
      uploaded_at: rest.createdAt,
    }));

    res.json({ history: formatted });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ── DELETE /api/history/:paper_id ────────────────────────────────────────────
router.delete("/:paper_id", async (req, res) => {
  try {
    await History.findOneAndDelete({
      user_id: req.user._id,
      paper_id: req.params.paper_id,
    });
    res.json({ status: "deleted" });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
