/**
 * @swagger
 * /lessons/main-categories:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get all main categories
 *     description: |
 *       Get the 2 main lesson categories
 *
 *       **Requires authentication** - Child token required
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
 * /lessons/main-categories/{id}:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get main category contents
 *     description: |
 *       Returns category info with items array containing both subcategories and lessons.
 *       Each item has a type field: 'category' or 'lesson'
 *
 *       **Requires authentication** - Child token required
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category with items array
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /lessons/main-categories/{mainCategoryId}/subcategories/{subcategoryId}:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get lessons in subcategory
 *     description: |
 *       Returns subcategory info with items array containing lessons.
 *       Each item has type: 'lesson'
 *
 *       **Requires authentication** - Child token required
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
 *         description: Subcategory with items array
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get lesson details with next/previous navigation
 *     description: |
 *       Returns lesson content with navigation information for next/previous lessons.
 *       Frontend can use isFirst and isLast to disable navigation buttons.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lesson details with navigation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 audioUrl:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                 videoUrl:
 *                   type: string
 *                 starsReward:
 *                   type: integer
 *                 level:
 *                   type: integer
 *                 navigation:
 *                   type: object
 *                   properties:
 *                     previousLessonId:
 *                       type: string
 *                       nullable: true
 *                     nextLessonId:
 *                       type: string
 *                       nullable: true
 *                     isFirst:
 *                       type: boolean
 *                       description: True if this is the first lesson in category
 *                     isLast:
 *                       type: boolean
 *                       description: True if this is the last lesson in category
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /lessons/{id}/complete:
 *   post:
 *     tags:
 *       - Lessons
 *     summary: Mark lesson as complete
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
 *         description: Lesson completed
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
