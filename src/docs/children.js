/**
 * @swagger
 * /children/login:
 *   post:
 *     tags:
 *       - Children
 *     summary: Child login (Username Only - No Password!)
 *     description: |
 *       🎮 **NEW CHILD-CENTRIC APP** - No Parents Needed!
 *
 *       Authenticates a child using ONLY their username (no password required).
 *       Children are now standalone users - no parent linking!
 *       Returns a JWT token (NO EXPIRATION until logout).
 *
 *       **Key Changes:**
 *       - ✅ No parent account required
 *       - ✅ Token never expires (valid until logout)
 *       - ✅ Multiple profiles on same device (switch between children)
 *
 *       **How to Test in Swagger:**
 *       1. Click "Try it out"
 *       2. Enter only the username (e.g., "AminaStar")
 *       3. Click "Execute"
 *       4. Copy the accessToken from response
 *       5. Click "Authorize" button at top
 *       6. Paste: `Bearer YOUR_TOKEN`
 *       7. Click "Authorize" then "Close"
 *       8. Now test all child endpoints!
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: AminaStar
 *                 description: The child's unique username
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   description: Access token (NO EXPIRATION - valid until logout)
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     username:
 *                       type: string
 *                       example: AminaStar
 *                     displayName:
 *                       type: string
 *                       example: Amina
 *                     role:
 *                       type: string
 *                       example: child
 *                     level:
 *                       type: integer
 *                       example: 1
 *                     stars:
 *                       type: integer
 *                       example: 45
 *                     avatarUrl:
 *                       type: string
 *                       nullable: true
 *       401:
 *         description: Invalid username
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /children/logout:
 *   post:
 *     tags:
 *       - Children
 *     summary: Child logout
 *     description: |
 *       Logs out the authenticated child and revokes the token.
 *       Token is blacklisted and cannot be used again.
 *       Frontend should delete stored token after logout.
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
 * /children/register:
 *   post:
 *     tags:
 *       - Children
 *     summary: Register a child profile
 *     description: |
 *       🎮 **NEW SIMPLIFIED REGISTRATION**
 *
 *       Creates a new child profile - NO PARENT REQUIRED!
 *       Children are now standalone users who can register directly.
 *
 *       **NEW Required Fields:**
 *       - username (unique, used for login)
 *       - displayName (shown in app)
 *       - age (3-18 years old)
 *       - sex (male or female)
 *
 *       **What Changed:**
 *       - ❌ NO parentId needed
 *       - ❌ NO ageGroup (replaced with exact age)
 *       - ✅ Added age (integer 3-18)
 *       - ✅ Added sex (male/female)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - displayName
 *               - age
 *               - sex
 *             properties:
 *               username:
 *                 type: string
 *                 example: AminaStar
 *                 description: Unique username (used for login)
 *               displayName:
 *                 type: string
 *                 example: Amina
 *                 description: Display name shown in app
 *               age:
 *                 type: integer
 *                 minimum: 3
 *                 maximum: 18
 *                 example: 10
 *                 description: Child's age in years
 *               sex:
 *                 type: string
 *                 enum: [male, female]
 *                 example: female
 *                 description: Child's gender
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 description: Optional avatar URL
 *     responses:
 *       201:
 *         description: Child profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 childId:
 *                   type: string
 *                   format: uuid
 *                 username:
 *                   type: string
 *                   example: AminaStar
 *                 message:
 *                   type: string
 *                   example: Child profile created successfully. Use username to login.
 *       400:
 *         description: Missing/invalid fields
 *       409:
 *         description: Username already taken
 */

/**
 * @swagger
 * /children/me:
 *   get:
 *     tags:
 *       - Children
 *     summary: Get complete child profile
 *     description: |
 *       📊 **ENHANCED PROFILE ENDPOINT**
 *
 *       Returns EVERYTHING a child needs in their profile:
 *       - Basic info (username, age, sex, level, stars, streaks)
 *       - Achievements (unlocked badges/awards)
 *       - Notifications (last 10)
 *       - Leaderboard rankings (daily, weekly, monthly)
 *
 *       Perfect for profile screen showing all child data!
 *     responses:
 *       200:
 *         description: Complete profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 username:
 *                   type: string
 *                   example: AminaStar
 *                 displayName:
 *                   type: string
 *                   example: Amina
 *                 age:
 *                   type: integer
 *                   example: 10
 *                 sex:
 *                   type: string
 *                   enum: [male, female]
 *                   example: female
 *                 level:
 *                   type: integer
 *                   example: 3
 *                 totalStars:
 *                   type: integer
 *                   example: 245
 *                 currentStreak:
 *                   type: integer
 *                   example: 7
 *                   description: Days in a row with activity
 *                 maxStreak:
 *                   type: integer
 *                   example: 15
 *                   description: Best streak ever
 *                 avatarUrl:
 *                   type: string
 *                   format: uri
 *                   nullable: true
 *                 lastActivityDate:
 *                   type: string
 *                   format: date
 *                 achievements:
 *                   type: array
 *                   description: Unlocked achievements
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: First Steps
 *                       description:
 *                         type: string
 *                         example: Complete your first lesson
 *                       iconUrl:
 *                         type: string
 *                         format: uri
 *                       unlockedAt:
 *                         type: string
 *                         format: date-time
 *                 notifications:
 *                   type: array
 *                   description: Recent notifications (last 10)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                         example: achievement
 *                       title:
 *                         type: string
 *                         example: New Achievement!
 *                       message:
 *                         type: string
 *                         example: You unlocked First Steps badge
 *                       read:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 leaderboard:
 *                   type: array
 *                   description: Rankings in different periods
 *                   items:
 *                     type: object
 *                     properties:
 *                       period:
 *                         type: string
 *                         enum: [daily, weekly, monthly]
 *                       rank:
 *                         type: integer
 *                         example: 5
 *                       stars:
 *                         type: integer
 *                         example: 45
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /children/me/notification-prefs:
 *   get:
 *     tags:
 *       - Children
 *     summary: Get notification preferences
 *     description: Retrieves notification preferences for the authenticated child
 *     responses:
 *       200:
 *         description: Preferences retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pushTips:
 *                   type: boolean
 *                 pushReminders:
 *                   type: boolean
 *                 locale:
 *                   type: string
 *                   example: en
 *                 quietHours:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       example: "21:00"
 *                     end:
 *                       type: string
 *                       example: "07:00"
 *                     timezone:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     tags:
 *       - Children
 *     summary: Update notification preferences
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pushTips:
 *                 type: boolean
 *               pushReminders:
 *                 type: boolean
 *               locale:
 *                 type: string
 *               quietHours:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                   end:
 *                     type: string
 *                   timezone:
 *                     type: string
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /children/me/favorites:
 *   get:
 *     tags:
 *       - Children
 *     summary: Get favorite lessons
 *     responses:
 *       200:
 *         description: Favorites list
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags:
 *       - Children
 *     summary: Add lesson to favorites
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessonId
 *             properties:
 *               lessonId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Added
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /children/me/favorites/{lessonId}:
 *   delete:
 *     tags:
 *       - Children
 *     summary: Remove from favorites
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Removed
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /children/me:
 *   put:
 *     tags:
 *       - Children
 *     summary: Update child profile
 *     description: |
 *       Update display name, age, or avatar.
 *       Note: Cannot change username or sex after registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: Amina Star
 *               age:
 *                 type: integer
 *                 minimum: 3
 *                 maximum: 18
 *                 example: 11
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Invalid age
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /children/me/avatar:
 *   post:
 *     tags:
 *       - Children
 *     summary: Upload avatar
 *     description: |
 *       Upload avatar image (base64 encoded).
 *       Max 2MB, formats: JPG, PNG, GIF, WEBP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 description: Base64 encoded image
 *               fileName:
 *                 type: string
 *                 example: avatar.png
 *     responses:
 *       200:
 *         description: Uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 avatarUrl:
 *                   type: string
 *       400:
 *         description: Invalid file
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
