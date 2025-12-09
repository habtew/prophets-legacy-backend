/**
 * @swagger
 * /internal/workers/campaign-dispatch:
 *   post:
 *     tags:
 *       - Internal Workers
 *     summary: Dispatch notification campaign
 *     description: Internal endpoint to dispatch a scheduled notification campaign
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaignId
 *             properties:
 *               campaignId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Campaign dispatched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 notificationsSent:
 *                   type: integer
 *                   example: 150
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /internal/workers/notify-child:
 *   post:
 *     tags:
 *       - Internal Workers
 *     summary: Send event-based child notification
 *     description: Internal endpoint to send notification to child about their activity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childId
 *               - eventType
 *               - message
 *             properties:
 *               childId:
 *                 type: string
 *                 format: uuid
 *               eventType:
 *                 type: string
 *                 enum: [lesson_completed, challenge_completed, achievement_unlocked]
 *                 example: lesson_completed
 *               message:
 *                 type: string
 *                 example: Great job! You completed 'The Prophet's Smile'!
 *     responses:
 *       200:
 *         description: Notification queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 deliveryStatus:
 *                   type: string
 *                   example: queued
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /internal/workers/share-render:
 *   post:
 *     tags:
 *       - Internal Workers
 *     summary: Render shareable asset
 *     description: Internal endpoint to process and render a shareable asset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shareId
 *             properties:
 *               shareId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Asset rendered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 outputUrl:
 *                   type: string
 *                   format: uri
 *                   example: url_to_rendered_asset
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /internal/workers/update-leaderboards:
 *   post:
 *     tags:
 *       - Internal Workers
 *     summary: Update leaderboards
 *     description: Internal endpoint to recalculate leaderboard rankings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - period
 *             properties:
 *               period:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *                 example: daily
 *     responses:
 *       200:
 *         description: Leaderboard updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 period:
 *                   type: string
 *                   example: daily
 *                 entriesCalculated:
 *                   type: integer
 *                   example: 500
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /internal/workers/check-achievements:
 *   post:
 *     tags:
 *       - Internal Workers
 *     summary: Check achievement unlocks
 *     description: Internal endpoint to check and unlock achievements for a child
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childId
 *             properties:
 *               childId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Achievements checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 achievementsUnlocked:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *                   example: ["a1", "a3"]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /internal/workers/update-streaks:
 *   post:
 *     tags:
 *       - Internal Workers
 *     summary: Update streaks
 *     description: Internal endpoint to update or reset child activity streaks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Streaks updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 streaksUpdated:
 *                   type: integer
 *                   example: 120
 *                 streaksReset:
 *                   type: integer
 *                   example: 45
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
