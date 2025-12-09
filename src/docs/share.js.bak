/**
 * @swagger
 * /share/render:
 *   post:
 *     tags:
 *       - Social Sharing
 *     summary: Render a shareable asset
 *     description: Creates a job to render a shareable asset (image/video). Ensures no PII
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceType
 *               - sourceId
 *               - format
 *             properties:
 *               sourceType:
 *                 type: string
 *                 enum: [lesson, challenge, achievement]
 *                 example: lesson
 *               sourceId:
 *                 type: string
 *                 format: uuid
 *               format:
 *                 type: string
 *                 enum: [image, video]
 *                 example: image
 *     responses:
 *       202:
 *         description: Job created and queued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shareId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   example: pending
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /share/{shareId}:
 *   get:
 *     tags:
 *       - Social Sharing
 *     summary: Get status of shareable asset
 *     description: Checks the rendering job status and gets the download URL
 *     parameters:
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the share job
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, processing, completed, failed]
 *                   example: completed
 *                 downloadUrl:
 *                   type: string
 *                   format: uri
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /share/{shareId}/track:
 *   post:
 *     tags:
 *       - Social Sharing
 *     summary: Track social share (Telemetry)
 *     description: Telemetry endpoint to track which platform content was shared to
 *     security: []
 *     parameters:
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the share job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platform
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [whatsapp, facebook, twitter, instagram, telegram]
 *                 example: whatsapp
 *     responses:
 *       200:
 *         description: Tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */
