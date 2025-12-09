/**
 * @swagger
 * /progress/me/summary:
 *   get:
 *     tags:
 *       - Progress & Leaderboard
 *     summary: Get child's progress summary
 *     description: Retrieves the complete progress summary for the authenticated child's dashboard
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressSummary'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /leaderboard:
 *   get:
 *     tags:
 *       - Progress & Leaderboard
 *     summary: Get leaderboard
 *     description: Retrieves the pre-calculated leaderboard for a specific time period
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: The time period for the leaderboard
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Leaderboard'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
