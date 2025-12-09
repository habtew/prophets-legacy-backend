/**
 * @swagger
 * /auth/parent/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new parent account
 *     description: Creates a new parent account and triggers a confirmation email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: parent@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123
 *               name:
 *                 type: string
 *                 example: Fatima Ibrahim
 *               phone:
 *                 type: string
 *                 example: +251900000000
 *     responses:
 *       201:
 *         description: Registration successful
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
 *                   example: Registration successful. Please confirm your email.
 *                 parentId:
 *                   type: string
 *                   format: uuid
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 */

/**
 * @swagger
 * /auth/parent/confirm:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Confirm parent's email address
 *     description: Verifies a parent's email address using the confirmation link from email. This endpoint is called automatically when clicking the confirmation link.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token_hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Token hash from confirmation email
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification type from email
 *     responses:
 *       200:
 *         description: Email verified successfully
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
 *                   example: Email verified successfully. You can now log in.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login (Parent or Admin)
 *     description: Authenticates a user and returns a JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: parent@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Pass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     role:
 *                       type: string
 *                       example: parent
 *                     name:
 *                       type: string
 *                       example: Fatima
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /auth/password-reset/request:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset
 *     description: Initiates the password reset process by sending a link to the user's email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: parent@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent
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
 *                   example: Password reset link sent.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */

/**
 * @swagger
 * /auth/password-reset/confirm:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Confirm new password
 *     description: Sets a new password using the token from the reset email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: resetTokenFromEmail
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePass456
 *     responses:
 *       200:
 *         description: Password reset successful
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
 *                   example: Password has been reset successfully.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Parent logout
 *     description: |
 *       Logs out the authenticated parent. Client should delete the stored JWT token.
 *
 *       **Note:** JWT tokens are stateless, so this endpoint simply confirms logout.
 *       The client must delete the token from storage to complete the logout process.
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *                   example: Logged out successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /admin/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Admin logout
 *     description: |
 *       Logs out the authenticated admin. Client should delete the stored JWT token.
 *
 *       **Note:** JWT tokens are stateless, so this endpoint simply confirms logout.
 *       The client must delete the token from storage to complete the logout process.
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *                   example: Logged out successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: |
 *       Use a valid refresh token to get a new access token and refresh token pair.
 *       Access tokens expire in 1 hour, refresh tokens expire in 7 days.
 *       This endpoint rotates tokens - the old refresh token becomes invalid.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
 *                 description: The refresh token received during login
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   description: New access token (1 hour expiry)
 *                 refreshToken:
 *                   type: string
 *                   example: 7f9e8d091773c6d548a1fdaa1c44ad125b2ce3f0a1a1b711bc04d5c04a0e11b19
 *                   description: New refresh token (7 days expiry)
 *                 expiresIn:
 *                   type: string
 *                   example: "1h"
 *                   description: Access token expiry time
 *       400:
 *         description: Refresh token is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
