/**
 * @swagger
 * /analytics/users:
 *   get:
 *     tags:
 *       - Admin - Analytics
 *     summary: Get user statistics (Admin only)
 *     description: Returns comprehensive user statistics including total users, new users, active users, demographics, retention rate
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRegisteredChildren:
 *                   type: integer
 *                 newUsers:
 *                   type: object
 *                   properties:
 *                     daily:
 *                       type: integer
 *                     weekly:
 *                       type: integer
 *                     monthly:
 *                       type: integer
 *                 activeUsers:
 *                   type: object
 *                   properties:
 *                     daily:
 *                       type: integer
 *                     weekly:
 *                       type: integer
 *                     monthly:
 *                       type: integer
 *                 demographics:
 *                   type: object
 *                   properties:
 *                     ageDistribution:
 *                       type: object
 *                     genderDistribution:
 *                       type: object
 *                     countryDistribution:
 *                       type: object
 *                 retentionRate:
 *                   type: integer
 *                 averageUsageTimeMinutes:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /analytics/activity:
 *   get:
 *     tags:
 *       - Admin - Analytics
 *     summary: Get activity statistics (Admin only)
 *     description: Returns activity metrics including completions, answer accuracy, most/least used content
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Activity statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completions:
 *                   type: object
 *                   properties:
 *                     totalLessons:
 *                       type: integer
 *                     totalChallenges:
 *                       type: integer
 *                 answers:
 *                   type: object
 *                   properties:
 *                     correct:
 *                       type: integer
 *                     incorrect:
 *                       type: integer
 *                     accuracy:
 *                       type: integer
 *                 popularity:
 *                   type: object
 *                   properties:
 *                     mostUsedLessons:
 *                       type: array
 *                       items:
 *                         type: object
 *                     leastUsedLessons:
 *                       type: array
 *                       items:
 *                         type: object
 *                 averageProgressRate:
 *                   type: integer
 *                 averageTimePerActivitySeconds:
 *                   type: integer
 *                 interactionLevels:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /analytics/technical:
 *   get:
 *     tags:
 *       - Admin - Analytics
 *     summary: Get technical statistics (Admin only)
 *     description: Returns technical metrics including logins, device types, crash rate, performance
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Technical statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loginCount:
 *                   type: integer
 *                 deviceTypes:
 *                   type: object
 *                 crashRate:
 *                   type: number
 *                 totalCrashes:
 *                   type: integer
 *                 averagePageLoadTimeMs:
 *                   type: integer
 *                 supportTicketsSubmitted:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /analytics/general:
 *   get:
 *     tags:
 *       - Admin - Analytics
 *     summary: Get general statistics (Admin only)
 *     description: Returns general app statistics including top countries, user growth rate
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: General statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topCountries:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       country:
 *                         type: string
 *                       users:
 *                         type: integer
 *                 userGrowthRate:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /analytics/track/login:
 *   post:
 *     tags:
 *       - Analytics - Tracking
 *     summary: Track login event (Child only)
 *     description: Records a login event with device type and country information
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceType
 *             properties:
 *               deviceType:
 *                 type: string
 *                 enum: [iOS, Android, Web]
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login tracked successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /analytics/track/activity:
 *   post:
 *     tags:
 *       - Analytics - Tracking
 *     summary: Track activity event (Child only)
 *     description: Records user interaction events like clicks, sounds, animations
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *             properties:
 *               eventType:
 *                 type: string
 *                 example: button_click
 *               eventData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Activity tracked successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /analytics/track/technical:
 *   post:
 *     tags:
 *       - Analytics - Tracking
 *     summary: Track technical event (Public)
 *     description: Records crashes, errors, and performance metrics. No authentication required for crash reporting.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *             properties:
 *               eventType:
 *                 type: string
 *                 enum: [crash, error, performance, support_ticket]
 *               errorMessage:
 *                 type: string
 *               stackTrace:
 *                 type: string
 *               deviceInfo:
 *                 type: object
 *     responses:
 *       200:
 *         description: Technical event tracked successfully
 */

module.exports = {};
