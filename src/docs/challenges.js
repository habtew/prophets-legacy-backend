/**
 * @swagger
 * /challenge-categories:
 *   get:
 *     tags:
 *       - Challenges
 *     summary: Get all challenge categories for a level
 *     description: Retrieves challenge categories with lock status and completion tracking. Frontend should load next incomplete challenge.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         required: true
 *         schema:
 *           type: integer
 *         description: The level number to fetch
 *       - in: query
 *         name: childId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The child's UUID to check unlock status
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       level:
 *                         type: integer
 *                       isLocked:
 *                         type: boolean
 *                       isCompleted:
 *                         type: boolean
 *                         description: True if child has passed this challenge
 *                       questionCount:
 *                         type: integer
 *                       unlockRequirement:
 *                         type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /attempt-sessions:
 *   post:
 *     tags:
 *       - Challenges
 *     summary: Start a challenge session
 *     description: Creates a session for authenticated child to attempt a series of questions. childId is automatically determined from auth token.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - challengeCategoryId
 *             properties:
 *               challengeCategoryId:
 *                 type: string
 *                 format: uuid
 *                 description: The challenge category to attempt
 *     responses:
 *       201:
 *         description: Session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: Session started.
 *                 questionCount:
 *                   type: integer
 *                   example: 3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /attempt-sessions/{sessionId}/next-question:
 *   get:
 *     tags:
 *       - Challenges
 *     summary: Get the next question in a session
 *     description: Fetches the next question in the sequence for an ongoing attempt session
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the attempt session
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questionId:
 *                   type: string
 *                   format: uuid
 *                 type:
 *                   type: string
 *                   example: multiple_choice
 *                 question:
 *                   type: string
 *                   example: What was the first battle in Islam?
 *                 options:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Badr", "Uhud", "Hunain"]
 *                 timeLimitSec:
 *                   type: integer
 *                   example: 30
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /attempt-sessions/{sessionId}/answers:
 *   post:
 *     tags:
 *       - Challenges
 *     summary: Submit an answer (supports retry on wrong answers)
 *     description: |
 *       Submits an answer with automatic time tracking and penalty calculation.
 *       - Time tracking starts when question is fetched
 *       - Time penalty applied if exceeds question's time limit
 *       - Repeat attempt penalty applied for wrong answers (allows retry)
 *       - Wrong answers can be retried until correct answer is submitted
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the attempt session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - answer
 *             properties:
 *               questionId:
 *                 type: string
 *                 format: uuid
 *               answer:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *                 example: Badr
 *     responses:
 *       200:
 *         description: Answer processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 correct:
 *                   type: boolean
 *                   example: true
 *                 score:
 *                   type: integer
 *                   example: 8
 *                   description: Score after penalties
 *                 timeTakenSec:
 *                   type: integer
 *                   example: 45
 *                   description: Time taken for this question
 *                 attemptNumber:
 *                   type: integer
 *                   example: 2
 *                 penalties:
 *                   type: object
 *                   properties:
 *                     timePenalty:
 *                       type: integer
 *                       example: 1
 *                     repeatPenalty:
 *                       type: integer
 *                       example: 2
 *                 canRetry:
 *                   type: boolean
 *                   example: false
 *                   description: Whether answer can be retried (true if wrong)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Question already answered correctly
 */

/**
 * @swagger
 * /attempt-sessions/{sessionId}/finish:
 *   post:
 *     tags:
 *       - Challenges
 *     summary: Finish a challenge session
 *     description: Concludes the session, calculates the final score, awards stars, and returns the new progress state
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the attempt session
 *     responses:
 *       200:
 *         description: Session finished and scored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   format: uuid
 *                 finalScore:
 *                   type: integer
 *                   example: 75
 *                 scoring:
 *                   type: object
 *                   properties:
 *                     baseScore:
 *                       type: integer
 *                       example: 90
 *                     timePenalty:
 *                       type: integer
 *                       example: -5
 *                     repeatAttemptPenalty:
 *                       type: integer
 *                       example: -10
 *                 starsEarned:
 *                   type: integer
 *                   example: 4
 *                 passed:
 *                   type: boolean
 *                   example: true
 *                 celebration:
 *                   type: object
 *                   properties:
 *                     sfxId:
 *                       type: string
 *                       format: uuid
 *                     animationId:
 *                       type: string
 *                       format: uuid
 *                 newProgress:
 *                   $ref: '#/components/schemas/ProgressSummary'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
