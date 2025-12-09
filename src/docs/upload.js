/**
 * @swagger
 * /upload/image:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload an image file (authenticated)
 *     description: |
 *       Upload an image file directly to Supabase Storage.
 *
 *       **No base64 conversion needed** - just upload the file!
 *
 *       **How to use:**
 *       1. Login and get your JWT token
 *       2. Use the token in Authorization header
 *       3. Upload image file using multipart/form-data
 *       4. Receive the public URL back
 *
 *       **Supported buckets:**
 *       - avatars (default)
 *       - backgrounds
 *       - lesson-assets
 *       - sfx
 *       - animations
 *       - shareables
 *
 *       **Limits:**
 *       - Maximum file size: 5MB
 *       - Allowed formats: JPG, PNG, GIF, WEBP
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *               bucket:
 *                 type: string
 *                 enum: [avatars, backgrounds, lesson-assets, sfx, animations, shareables]
 *                 default: avatars
 *                 description: Storage bucket to upload to
 *     responses:
 *       200:
 *         description: File uploaded successfully
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
 *                   example: File uploaded successfully
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: https://your-project.supabase.co/storage/v1/object/public/avatars/user-id_1699564321.png
 *                 fileName:
 *                   type: string
 *                   example: user-id_1699564321.png
 *                 bucket:
 *                   type: string
 *                   example: avatars
 *       400:
 *         description: Bad request - no file or invalid bucket
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
 *                   example: No file uploaded
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Upload failed
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
 *                   example: Failed to upload file
 *                 details:
 *                   type: string
 */

/**
 * @swagger
 * /upload/public/image:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload an image file (public - no authentication required)
 *     description: |
 *       Upload an image file directly to Supabase Storage without authentication.
 *
 *       **Perfect for testing!**
 *
 *       **No base64 conversion needed** - just upload the file!
 *
 *       **How to use:**
 *       1. Select your image file
 *       2. Upload using multipart/form-data
 *       3. Receive the public URL back immediately
 *
 *       **Supported buckets:**
 *       - avatars (default)
 *       - backgrounds
 *       - lesson-assets
 *       - sfx
 *       - animations
 *       - shareables
 *
 *       **Limits:**
 *       - Maximum file size: 5MB
 *       - Allowed formats: JPG, PNG, GIF, WEBP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *               bucket:
 *                 type: string
 *                 enum: [avatars, backgrounds, lesson-assets, sfx, animations, shareables]
 *                 default: avatars
 *                 description: Storage bucket to upload to
 *     responses:
 *       200:
 *         description: File uploaded successfully
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
 *                   example: File uploaded successfully
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: https://your-project.supabase.co/storage/v1/object/public/avatars/public_1699564321.png
 *                 fileName:
 *                   type: string
 *                   example: public_1699564321.png
 *                 bucket:
 *                   type: string
 *                   example: avatars
 *       400:
 *         description: Bad request - no file or invalid bucket
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
 *                   example: No file uploaded
 *       500:
 *         description: Upload failed
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
 *                   example: Failed to upload file
 *                 details:
 *                   type: string
 */
