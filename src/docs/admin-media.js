/**
 * @swagger
 * /admin/media/upload-url:
 *   post:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Get media upload URL
 *     description: Gets a presigned URL to upload media (audio, images) to storage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *               - contentType
 *             properties:
 *               filename:
 *                 type: string
 *                 example: lesson1.mp3
 *               contentType:
 *                 type: string
 *                 example: audio/mpeg
 *     responses:
 *       200:
 *         description: Upload URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   format: uri
 *                   example: https://storage.example.com/presigned-url
 *                 assetKey:
 *                   type: string
 *                   example: unique_asset_key
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/sfx:
 *   get:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Get all sound effects (SFX)
 *     description: Retrieves all sound effects
 *     responses:
 *       200:
 *         description: SFX retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SFX'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Add a new sound effect (SFX)
 *     description: Adds a new sound effect to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sfxUrl
 *             properties:
 *               name:
 *                 type: string
 *                 example: Level Up Sound
 *               sfxUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: SFX added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sfxId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: SFX added.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/sfx/{id}:
 *   delete:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Delete a sound effect (SFX)
 *     description: Deletes a sound effect from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The SFX UUID
 *     responses:
 *       200:
 *         description: SFX deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/animations:
 *   get:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Get all animations
 *     description: Retrieves all celebration animations
 *     responses:
 *       200:
 *         description: Animations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Animation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Add a new animation
 *     description: Adds a new celebration animation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - animationUrl
 *             properties:
 *               name:
 *                 type: string
 *                 example: Star Burst
 *               animationUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Animation added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 animationId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: Animation added.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/animations/{id}:
 *   delete:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Delete an animation
 *     description: Deletes a celebration animation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The animation UUID
 *     responses:
 *       200:
 *         description: Animation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/notification-templates:
 *   get:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Get all notification templates
 *     description: Retrieves all notification templates
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotificationTemplate'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Create a notification template
 *     description: Creates a new notification template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *                 example: Morning Adhkar Reminder
 *               type:
 *                 type: string
 *                 enum: [reminder, tip, announcement]
 *                 example: reminder
 *               content:
 *                 type: object
 *                 properties:
 *                   en:
 *                     type: string
 *                     example: Don't forget your morning adhkār! ☀️
 *                   ar:
 *                     type: string
 *                     example: لا تنس أذكار الصباح! ☀️
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 templateId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: Template created.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/notification-templates/{id}:
 *   put:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Update a notification template
 *     description: Updates an existing notification template
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The template UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               content:
 *                 type: object
 *                 properties:
 *                   en:
 *                     type: string
 *                   ar:
 *                     type: string
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Delete a notification template
 *     description: Deletes a notification template
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The template UUID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/notifications/campaigns:
 *   post:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Create a notification campaign
 *     description: Schedules a new notification campaign
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - target
 *               - schedule
 *             properties:
 *               templateId:
 *                 type: string
 *                 format: uuid
 *               target:
 *                 type: object
 *                 properties:
 *                   ageGroup:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["8-10"]
 *               schedule:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-15T09:00:00Z
 *     responses:
 *       201:
 *         description: Campaign scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaignId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: Campaign scheduled.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/notifications/campaigns/{id}/test:
 *   post:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Send a test notification
 *     description: Sends a test notification to a specific user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The campaign UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/avatars/predefined:
 *   post:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Upload predefined avatar for children to choose
 *     description: |
 *       Admins can upload predefined avatar images that children can select instead of uploading their own.
 *
 *       **Categories:** animals, characters, emojis, islamic, general (default)
 *
 *       **Order Index:** Lower numbers appear first.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - name
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The avatar image file
 *               name:
 *                 type: string
 *                 example: Happy Lion
 *               category:
 *                 type: string
 *                 example: animals
 *                 default: general
 *               orderIndex:
 *                 type: integer
 *                 example: 0
 *                 default: 0
 *     responses:
 *       201:
 *         description: Avatar uploaded successfully
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 */

/**
 * @swagger
 * /admin/avatars/predefined/{id}:
 *   put:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Update predefined avatar details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               orderIndex:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *   delete:
 *     tags:
 *       - Admin - Media & Notifications
 *     summary: Delete predefined avatar
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 */

/**
 * @swagger
 * /avatars/predefined:
 *   get:
 *     tags:
 *       - Avatars
 *     summary: Get all predefined avatars (authenticated users)
 *     description: |
 *       Get all predefined avatars that children can choose from.
 *       
 *       **Available to:** Children, Parents, Admins - anyone with a valid token
 *       
 *       **Filter options:**
 *       - By category (animals, characters, emojis, islamic, general)
 *       - Active only (default) or include inactive
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *         example: animals
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Show only active avatars
 *     responses:
 *       200:
 *         description: Avatars retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 avatars:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: Happy Lion
 *                       image_url:
 *                         type: string
 *                         format: uri
 *                       category:
 *                         type: string
 *                         example: animals
 *                       order_index:
 *                         type: integer
 *                         example: 0
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 */
