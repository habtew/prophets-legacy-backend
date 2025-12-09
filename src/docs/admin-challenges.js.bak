/**
 * @swagger
 * /admin/challenge-categories:
 *   get:
 *     tags:
 *       - Admin - Challenges
 *     summary: Get all challenge categories (Admin)
 *     description: Retrieves all challenge categories for admin management
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                     example: Word Ordering
 *                   level:
 *                     type: integer
 *                     example: 1
 *                   questionCount:
 *                     type: integer
 *                     example: 3
 *                   isPublished:
 *                     type: boolean
 *                     example: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags:
 *       - Admin - Challenges
 *     summary: Create a challenge category
 *     description: Creates a new challenge category in draft status
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
 *                 example: Hadith Arrangement
 *               level:
 *                 type: integer
 *                 example: 1
 *               passPercentage:
 *                 type: integer
 *                 example: 70
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categoryId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: Challenge Category created. It is currently in draft.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/challenge-categories/{id}:
 *   put:
 *     tags:
 *       - Admin - Challenges
 *     summary: Update a challenge category
 *     description: Updates a challenge category. Cannot publish unless category has at least 3 questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The category UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Word Ordering Updated
 *               passPercentage:
 *                 type: integer
 *                 example: 80
 *               published:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Category updated
 *       400:
 *         description: Cannot publish (less than 3 questions)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Cannot publish - Category must have at least 3 questions
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     tags:
 *       - Admin - Challenges
 *     summary: Delete a challenge category
 *     description: Deletes a challenge category and all its questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The category UUID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Category and questions deleted.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/challenge-question-types:
 *   get:
 *     tags:
 *       - Admin - Challenges
 *     summary: Get all challenge question types
 *     description: Fetches the master list of all available question types
 *     responses:
 *       200:
 *         description: Question types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questionTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: letter_arrangement
 *                       name:
 *                         type: string
 *                         example: Letter Arrangement
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/challenge-categories/{id}/questions:
 *   get:
 *     tags:
 *       - Admin - Challenges
 *     summary: Get all questions for a category
 *     description: Retrieves all questions for a specific challenge category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The category UUID
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChallengeQuestion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags:
 *       - Admin - Challenges
 *     summary: Add a question to a category
 *     description: Adds a new question to a challenge category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The category UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - question
 *               - options
 *               - answer
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [word_ordering, multiple_choice, letter_arrangement, picture_matching]
 *                 example: word_ordering
 *               question:
 *                 type: string
 *                 example: Arrange the words...
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Religion", "is", "advice"]
 *               answer:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *                 example: ["Religion", "is", "advice"]
 *               timeLimitSec:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       201:
 *         description: Question added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questionId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: Question added.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/challenge-categories/{id}/questions/{qid}:
 *   put:
 *     tags:
 *       - Admin - Challenges
 *     summary: Update a question
 *     description: Updates an existing question
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The category UUID
 *       - in: path
 *         name: qid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The question UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               question:
 *                 type: string
 *                 example: Updated question text...
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               answer:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *               timeLimitSec:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     tags:
 *       - Admin - Challenges
 *     summary: Delete a question
 *     description: Deletes a question from a category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The category UUID
 *       - in: path
 *         name: qid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The question UUID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/challenge-categories/{id}/questions/reorder:
 *   patch:
 *     tags:
 *       - Admin - Challenges
 *     summary: Reorder questions in a category
 *     description: Changes the order of questions in a category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The category UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderedQuestionIds
 *             properties:
 *               orderedQuestionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["q3", "q1", "q2"]
 *     responses:
 *       200:
 *         description: Questions reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
