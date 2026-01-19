const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "The Prophet's Legacy API",
      version: '1.0.0',
      description: `Production-grade RESTful backend for The Prophet's Legacy Islamic learning platform

## 🚀 Quick Start Testing Guide

### 1. Test Child Login (USERNAME ONLY - No Password!)
1. **Register a child** - POST \`/children/register\` with username, displayName, age, sex
2. **Login as child** - POST \`/children/login\` with **username ONLY** (no password!)
   - Example: \`{"username": "AminaStar"}\`
3. **Authorize** - Click "Authorize" button, enter: \`YOUR_TOKEN\` (**DO NOT** include "Bearer ")
4. **Test endpoints** - Try \`GET /children/me\`, \`GET /reminders/me\`, \`GET /lessons/main-categories\`

### 3. Test Admin Login
1. **Login as admin** - POST \`/admin/auth/login\` with admin credentials
2. **Authorize** - Click "Authorize" with admin token
3. **View categories** - GET \`/admin/challenge-categories\` (returns 6 predefined!)
4. **Create category** - POST \`/admin/challenge-categories\` (NOW WORKS!)
5. **Add question** - POST \`/admin/challenge-categories/{id}/questions\` (NOW WORKS!)

## 📚 Pre-seeded Data

### Challenge Categories (6 Total, All Published!)
- **Level 1**: Word Ordering (3 questions), Picture Matching (3 questions)
- **Level 2**: Letter Arrangement (3 questions), Crossword Puzzle (3 questions)
- **Level 3**: Virtues Quiz (3 questions), Hadith Arrangement (3 questions)

### Question Types Available (10 Total)
letter_arrangement, multiple_choice, missing_word, crossword, word_ordering, tap_counter, word_to_word_match, word_to_image_match, audio_recording, sentence_completion_chips

## 🔑 Important Notes
- **Correct paths**: Use \`/children/me/\` not \`/users/me/\`, use \`/reminders/me\` not \`/children/me/reminders\`
- **All admin POST/PUT/DELETE endpoints now working** - Fixed authentication!
- **No childId needed** - Authenticated child ID used automatically`,
      contact: {
        name: 'API Support',
        email: 'support@prophetslegacy.com'
      }
    },
    servers: [
      {
        url: 'https://prophets-legacy-backend-production-7859.up.railway.app/api',
        description: 'Production server (Railway)'
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            }
          }
        },
        Parent: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'parent@example.com'
            },
            name: {
              type: 'string',
              example: 'Fatima Ibrahim'
            },
            phone: {
              type: 'string',
              example: '+251900000000'
            },
            email_confirmed: {
              type: 'boolean',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Child: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            username: {
              type: 'string',
              example: 'AminaStar'
            },
            display_name: {
              type: 'string',
              example: 'Amina'
            },
            age: {
              type: 'integer',
              minimum: 3,
              maximum: 18,
              example: 10
            },
            sex: {
              type: 'string',
              enum: ['male', 'female'],
              example: 'female'
            },
            avatar_url: {
              type: 'string',
              format: 'uri'
            },
            level: {
              type: 'integer',
              example: 1
            },
            total_stars: {
              type: 'integer',
              example: 85
            },
            current_streak: {
              type: 'integer',
              example: 5
            },
            last_activity_date: {
              type: 'string',
              format: 'date'
            }
          }
        },
        LessonCategory: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            title: {
              type: 'string',
              example: "Prophet's Description"
            },
            level: {
              type: 'integer',
              example: 1
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Lesson: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            category_id: {
              type: 'string',
              format: 'uuid'
            },
            level: {
              type: 'integer',
              example: 1
            },
            title: {
              type: 'string',
              example: "The Prophet's Face"
            },
            description: {
              type: 'string',
              example: 'The Messenger of Allah ﷺ had the most beautiful face...'
            },
            audio_url: {
              type: 'string',
              format: 'uri'
            },
            image_url: {
              type: 'string',
              format: 'uri'
            },
            video_url: {
              type: 'string',
              format: 'uri'
            },
            stars_reward: {
              type: 'integer',
              example: 5
            }
          }
        },
        ChallengeCategory: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Word Ordering'
            },
            level: {
              type: 'integer',
              example: 1
            },
            pass_percentage: {
              type: 'integer',
              example: 70
            },
            is_published: {
              type: 'boolean',
              example: true
            },
            isLocked: {
              type: 'boolean',
              example: false
            },
            questionCount: {
              type: 'integer',
              example: 3
            },
            unlockRequirement: {
              type: 'string',
              example: 'Complete all challenges in the previous level to unlock.'
            }
          }
        },
        ChallengeQuestion: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            category_id: {
              type: 'string',
              format: 'uuid'
            },
            type: {
              type: 'string',
              enum: ['multiple_choice', 'word_ordering', 'letter_arrangement', 'picture_matching'],
              example: 'multiple_choice'
            },
            question: {
              type: 'string',
              example: 'What was the first battle in Islam?'
            },
            options: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Badr', 'Uhud', 'Hunain']
            },
            answer: {
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } }
              ],
              example: 'Badr'
            },
            time_limit_sec: {
              type: 'integer',
              example: 30
            },
            order_index: {
              type: 'integer',
              example: 0
            }
          }
        },
        AttemptSession: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            child_id: {
              type: 'string',
              format: 'uuid'
            },
            category_id: {
              type: 'string',
              format: 'uuid'
            },
            status: {
              type: 'string',
              enum: ['active', 'completed'],
              example: 'active'
            },
            final_score: {
              type: 'integer',
              example: 75
            },
            stars_earned: {
              type: 'integer',
              example: 4
            },
            passed: {
              type: 'boolean',
              example: true
            }
          }
        },
        Achievement: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: "Prophet's Description Master"
            },
            description: {
              type: 'string',
              example: 'Complete all lessons in Prophet\'s Description category'
            },
            rule: {
              type: 'string',
              example: 'Complete all lessons in Prophet\'s Description category'
            },
            icon_url: {
              type: 'string',
              format: 'uri'
            }
          }
        },
        Reminder: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            child_id: {
              type: 'string',
              format: 'uuid',
              nullable: true
            },
            is_global: {
              type: 'boolean',
              example: false
            },
            title: {
              type: 'string',
              example: 'Morning Adhkar'
            },
            message: {
              type: 'string',
              example: 'Time for your morning remembrance'
            },
            time: {
              type: 'string',
              example: '06:30'
            },
            timezone: {
              type: 'string',
              example: 'Africa/Addis_Ababa'
            },
            repeat: {
              type: 'string',
              example: 'daily'
            },
            sound_ref: {
              type: 'string',
              example: 'default_chime.mp3'
            },
            enabled: {
              type: 'boolean',
              example: true
            }
          }
        },
        Leaderboard: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['daily', 'weekly', 'monthly'],
              example: 'weekly'
            },
            entries: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  rank: {
                    type: 'integer',
                    example: 1
                  },
                  childName: {
                    type: 'string',
                    example: 'Yusuf'
                  },
                  stars: {
                    type: 'integer',
                    example: 150
                  }
                }
              }
            }
          }
        },
        ProgressSummary: {
          type: 'object',
          properties: {
            currentLevel: {
              type: 'integer',
              example: 1
            },
            levelProgress: {
              type: 'object',
              properties: {
                completedInLevel: {
                  type: 'integer',
                  example: 7
                },
                totalInLevel: {
                  type: 'integer',
                  example: 10
                },
                percentage: {
                  type: 'integer',
                  example: 70
                }
              }
            },
            totalStars: {
              type: 'integer',
              example: 150
            },
            currentStreak: {
              type: 'integer',
              example: 5
            },
            achievementsUnlocked: {
              type: 'integer',
              example: 4
            },
            totalAchievements: {
              type: 'integer',
              example: 20
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            child_id: {
              type: 'string',
              format: 'uuid'
            },
            message: {
              type: 'string',
              example: 'Amina completed a challenge'
            },
            type: {
              type: 'string',
              enum: ['lesson_completed', 'challenge_completed', 'achievement_unlocked'],
              example: 'lesson_completed'
            },
            is_read: {
              type: 'boolean',
              example: false
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        NotificationTemplate: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Morning Adhkar Reminder'
            },
            type: {
              type: 'string',
              enum: ['reminder', 'tip', 'announcement'],
              example: 'reminder'
            },
            content: {
              type: 'object',
              properties: {
                en: {
                  type: 'string',
                  example: "Don't forget your morning adhkār!"
                },
                ar: {
                  type: 'string',
                  example: 'لا تنس أذكار الصباح!'
                }
              }
            }
          }
        },
        Shareable: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            child_id: {
              type: 'string',
              format: 'uuid'
            },
            source_type: {
              type: 'string',
              enum: ['lesson', 'challenge', 'achievement'],
              example: 'lesson'
            },
            source_id: {
              type: 'string',
              format: 'uuid'
            },
            format: {
              type: 'string',
              enum: ['image', 'video'],
              example: 'image'
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed'],
              example: 'completed'
            },
            download_url: {
              type: 'string',
              format: 'uri'
            }
          }
        },
        SFX: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Correct Answer'
            },
            url: {
              type: 'string',
              format: 'uri'
            }
          }
        },
        Animation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Star Burst'
            },
            url: {
              type: 'string',
              format: 'uri'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required or invalid token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Authentication required'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Insufficient permissions'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Resource not found'
              }
            }
          }
        },
        BadRequestError: {
          description: 'Invalid request parameters',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Invalid request parameters'
              }
            }
          }
        },
        ConflictError: {
          description: 'Resource conflict',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Resource already exists'
              }
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User registration, login, and password management'
      },
      {
        name: 'Parents',
        description: 'Parent profile and dashboard management'
      },
      {
        name: 'Children',
        description: 'Child profile and preferences management'
      },
      {
        name: 'Lessons',
        description: 'Educational lesson content and progress tracking'
      },
      {
        name: 'Challenges',
        description: 'Quiz challenges and attempt sessions'
      },
      {
        name: 'Reminders',
        description: 'Personal and global reminder management'
      },
      {
        name: 'Progress & Leaderboard',
        description: 'Progress tracking and leaderboard rankings'
      },
      {
        name: 'Social Sharing',
        description: 'Shareable asset generation and tracking'
      },
      {
        name: 'Admin - Authentication',
        description: 'Admin authentication endpoints (login, setup, logout)'
      },
      {
        name: 'Admin - Lessons',
        description: 'Admin endpoints for lesson management'
      },
      {
        name: 'Admin - Challenges',
        description: 'Admin endpoints for challenge management'
      },
      {
        name: 'Admin - Media & Notifications',
        description: 'Admin endpoints for media assets and notifications'
      },
      {
        name: 'Internal Workers',
        description: 'Background job endpoints for internal use'
      },
      {
        name: 'System',
        description: 'System health and version information'
      },
      {
        name: 'Upload',
        description: 'Direct file upload endpoints (multipart/form-data)'
      },
      {
        name: 'Avatars',
        description: 'Predefined avatar management (available to all authenticated users)'
      },
      {
        name: 'Admin - Analytics',
        description: 'Admin-only analytics and statistics endpoints'
      },
      {
        name: 'Analytics - Tracking',
        description: 'Client-side event tracking endpoints'
      }
    ]
  },
  apis: ['./src/docs/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
