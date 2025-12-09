/**
 * @swagger
 * /admin/lessons/main-categories:
 *   get:
 *     tags:
 *       - Admin - Lessons
 *     summary: Get main categories (Admin)
 *     description: Same structure as public endpoint
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Main categories retrieved
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/lessons/main-categories/{id}:
 *   get:
 *     tags:
 *       - Admin - Lessons
 *     summary: Get main category contents (Admin)
 *     description: |
 *       Returns category info with items array.
 *       Each item has type: 'category' or 'lesson'
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category with items
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/lessons/main-categories/{mainCategoryId}/subcategories/{subcategoryId}:
 *   get:
 *     tags:
 *       - Admin - Lessons
 *     summary: Get subcategory lessons (Admin)
 *     description: |
 *       Returns subcategory info with items array.
 *       Each item has type: 'lesson'
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mainCategoryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subcategoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subcategory with items
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/lesson-categories/main:
 *   post:
 *     tags:
 *       - Admin - Lessons
 *     summary: Create main category
 *     description: Creates a top-level main category. Order index is auto-assigned.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - level
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Prophet's Life"
 *               level:
 *                 type: integer
 *                 example: 1
 *               description:
 *                 type: string
 *                 example: "Learn about the life of Prophet Muhammad (PBUH)"
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/category-image.jpg"
 *           example:
 *             name: "Prophet's Life"
 *             level: 1
 *             description: "Learn about the life of Prophet Muhammad (PBUH)"
 *             imageUrl: "https://example.com/category-image.jpg"
 *     responses:
 *       201:
 *         description: Main category created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 categoryId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: "Main category created."
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/lesson-categories/subcategories:
 *   post:
 *     tags:
 *       - Admin - Lessons
 *     summary: Create subcategory
 *     description: Creates a subcategory under specified main category. Order index is auto-assigned.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - level
 *               - mainCategoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Prophet's Appearance"
 *               level:
 *                 type: integer
 *                 example: 1
 *               mainCategoryId:
 *                 type: string
 *                 format: uuid
 *                 description: The main category this belongs to
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               description:
 *                 type: string
 *                 example: "Learn about the Prophet's physical appearance"
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/subcategory-image.jpg"
 *           example:
 *             name: "Prophet's Appearance"
 *             level: 1
 *             mainCategoryId: "123e4567-e89b-12d3-a456-426614174000"
 *             description: "Learn about the Prophet's physical appearance"
 *             imageUrl: "https://example.com/subcategory-image.jpg"
 *     responses:
 *       201:
 *         description: Subcategory created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 subcategoryId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: "Subcategory created."
 *       400:
 *         description: Bad request - missing required fields or main category not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/lesson-categories/{id}:
 *   put:
 *     tags:
 *       - Admin - Lessons
 *     summary: Update lesson category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Category updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     tags:
 *       - Admin - Lessons
 *     summary: Delete lesson category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/lessons:
 *   get:
 *     tags:
 *       - Admin - Lessons
 *     summary: Get all lessons (paginated)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lessons retrieved
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags:
 *       - Admin - Lessons
 *     summary: Create lesson with auto order index
 *     description: |
 *       Creates a new lesson in specified category (main or sub). Order index is automatically calculated.
 *       Provide categoryId to create lesson under any category type.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - level
 *               - title
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: Main category or subcategory ID
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               level:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "The Prophet's Face"
 *               description:
 *                 type: string
 *                 example: "Learn about the Prophet's physical appearance"
 *               audioUrl:
 *                 type: string
 *                 example: "https://example.com/audio.mp3"
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               videoUrl:
 *                 type: string
 *                 example: "https://example.com/video.mp4"
 *               starsReward:
 *                 type: integer
 *                 example: 5
 *                 default: 5
 *           example:
 *             categoryId: "123e4567-e89b-12d3-a456-426614174000"
 *             level: 1
 *             title: "The Prophet's Face"
 *             description: "Learn about the Prophet's physical appearance"
 *             audioUrl: "https://example.com/audio.mp3"
 *             imageUrl: "https://example.com/image.jpg"
 *             videoUrl: "https://example.com/video.mp4"
 *             starsReward: 5
 *     responses:
 *       201:
 *         description: Lesson created with auto-assigned order_index
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 lessonId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: "Lesson created."
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/lessons/{id}:
 *   put:
 *     tags:
 *       - Admin - Lessons
 *     summary: Update lesson
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               audioUrl:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               starsReward:
 *                 type: integer
 *               level:
 *                 type: integer
 *               categoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lesson updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     tags:
 *       - Admin - Lessons
 *     summary: Delete lesson
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
