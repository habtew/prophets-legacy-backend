/**
 * @swagger
 * /reminders/me:
 *   get:
 *     tags:
 *       - Reminders
 *     summary: Get all personal reminders
 *     description: Retrieves all personal reminders set by the logged-in child
 *     responses:
 *       200:
 *         description: Reminders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reminders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                         example: Qiyam al-Layl
 *                       time:
 *                         type: string
 *                         example: "03:00"
 *                       timezone:
 *                         type: string
 *                         example: Africa/Addis_Ababa
 *                       repeat:
 *                         type: string
 *                         example: daily
 *                       enabled:
 *                         type: boolean
 *                         example: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags:
 *       - Reminders
 *     summary: Create a personal reminder
 *     description: Creates a new personal reminder (triggers local notifications)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - time
 *             properties:
 *               title:
 *                 type: string
 *                 example: Morning Adhkar
 *               time:
 *                 type: string
 *                 example: "06:30"
 *               timezone:
 *                 type: string
 *                 example: Africa/Addis_Ababa
 *               repeat:
 *                 type: string
 *                 example: daily
 *               soundRef:
 *                 type: string
 *                 example: default_chime.mp3
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Reminder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reminderId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: Reminder created.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /reminders/me/{id}:
 *   put:
 *     tags:
 *       - Reminders
 *     summary: Update a personal reminder
 *     description: Updates an existing personal reminder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the reminder
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Evening Adhkar
 *               time:
 *                 type: string
 *                 example: "18:30"
 *               timezone:
 *                 type: string
 *                 example: Africa/Addis_Ababa
 *               repeat:
 *                 type: string
 *                 example: daily
 *               soundRef:
 *                 type: string
 *                 example: default_chime.mp3
 *               enabled:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Reminder updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     tags:
 *       - Reminders
 *     summary: Delete a personal reminder
 *     description: Deletes a personal reminder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the reminder
 *     responses:
 *       200:
 *         description: Reminder deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /admin/reminders:
 *   get:
 *     tags:
 *       - Reminders
 *     summary: Get all global reminders (Admin)
 *     description: Retrieves all global, admin-managed reminders
 *     responses:
 *       200:
 *         description: Global reminders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 globalReminders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                         example: Fasting (Mon/Thu)
 *                       message:
 *                         type: string
 *                         example: Remember to fast today
 *                       time:
 *                         type: string
 *                         example: "00:00"
 *                       repeat:
 *                         type: string
 *                         example: weekly
 *                       locale:
 *                         type: string
 *                         example: en
 *                       active:
 *                         type: boolean
 *                         example: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags:
 *       - Reminders
 *     summary: Create a global reminder (Admin)
 *     description: Creates a new global reminder template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Morning Adhkar
 *               message:
 *                 type: string
 *                 example: Start your day with remembrance...
 *               repeat:
 *                 type: string
 *                 example: daily
 *               locale:
 *                 type: string
 *                 example: en
 *               active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Global reminder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reminderId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: Global reminder created.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
