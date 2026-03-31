import { Router, type IRouter, type Request, type Response } from "express";
import { db, userProgressTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/progress", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [row] = await db
      .select()
      .from(userProgressTable)
      .where(eq(userProgressTable.userId, req.user.id));

    res.json({ data: row?.data ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch user progress");
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

router.put("/progress", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { data } = req.body as { data: unknown };
  if (!data || typeof data !== "object") {
    res.status(400).json({ error: "Missing or invalid data" });
    return;
  }

  try {
    await db
      .insert(userProgressTable)
      .values({ userId: req.user.id, data: data as Record<string, unknown> })
      .onConflictDoUpdate({
        target: userProgressTable.userId,
        set: {
          data: data as Record<string, unknown>,
          updatedAt: new Date(),
        },
      });

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to save user progress");
    res.status(500).json({ error: "Failed to save progress" });
  }
});

export default router;
