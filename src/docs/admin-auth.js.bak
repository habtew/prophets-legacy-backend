/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     tags:
 *       - Admin - Authentication
 *     summary: Admin login
 *     description: |
 *       Authenticates an admin user with email and password.
 *       Returns a JWT token that should be used in Authorization header for subsequent requests.
 *
 *       **Note:** Admin accounts must exist in the `admins` table in the database.
 *       Use `/admin/auth/setup-super-admin` to create the first admin account.
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
 *                 example: admin@prophetslegacy.com
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecureAdminPass123
 *                 description: Admin password
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
 *                   description: JWT token - use this in Authorization header as "Bearer {token}"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: f47ac10b-58cc-4372-a567-0e02b2c3d479
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: admin@prophetslegacy.com
 *                     name:
 *                       type: string
 *                       example: Admin User
 *                     role:
 *                       type: string
 *                       example: admin
 *                     isSuperAdmin:
 *                       type: boolean
 *                       example: true
 *                       description: Whether this admin has super admin privileges
 *       400:
 *         description: Missing email or password
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
 *                   example: Email and password are required
 *       401:
 *         description: Invalid credentials
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
 *                   example: Invalid email or password
 *                 details:
 *                   type: string
 *                   example: Invalid login credentials
 *       403:
 *         description: Not an admin account
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
 *                   example: Access denied - admin account not found
 *
 * /admin/auth/setup-super-admin:
 *   post:
 *     tags:
 *       - Admin - Authentication
 *     summary: Create super admin (One-time setup)
 *     description: |
 *       Creates the initial super admin account. This should only be called once during initial setup.
 *       Requires a setup key for security.
 *
 *       **Setup Key:** Check your environment variables for `SUPER_ADMIN_SETUP_KEY`
 *       or use the default: `prophets-legacy-super-admin-2024`
 *
 *       **Important:** After creating the super admin, you can use their account to create additional admins.
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
 *               - setupKey
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: superadmin@prophetslegacy.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SuperSecurePass123!
 *               name:
 *                 type: string
 *                 example: Super Admin
 *               setupKey:
 *                 type: string
 *                 example: prophets-legacy-super-admin-2024
 *                 description: Setup key from environment variable
 *     responses:
 *       201:
 *         description: Super admin created successfully
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
 *                   example: Super admin account created successfully! You can now log in.
 *                 adminId:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                   format: email
 *                 isSuperAdmin:
 *                   type: boolean
 *                   example: true
 *                 emailConfirmed:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Invalid setup key
 *       409:
 *         description: Admin already exists
 *
 * /admin/auth/logout:
 *   post:
 *     tags:
 *       - Admin - Authentication
 *     summary: Admin logout
 *     description: Logs out the current admin user
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

module.exports = {};
