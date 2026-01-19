// // const supabase = require('../config/supabase');

// // /**
// //  * Get main categories only
// //  */
// // const getMainCategories = async (req, res) => {
// //   try {
// //     const { data: categories, error } = await supabase
// //       .from('lesson_categories')
// //       .select('*')
// //       .eq('is_main_category', true)
// //       .order('order_index');

// //     if (error) {
// //       return res.status(500).json({ success: false, message: 'Failed to fetch main categories' });
// //     }

// //     res.status(200).json({
// //       categories: (categories || []).map(c => ({
// //         id: c.id,
// //         name: c.name,
// //         description: c.description,
// //         imageUrl: c.image_url,
// //         level: c.level,
// //         orderIndex: c.order_index
// //       }))
// //     });
// //   } catch (error) {
// //     console.error('Get main categories error:', error);
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };

// // /**
// //  * Get main category contents (subcategories and direct lessons)
// //  */
// // const getMainCategoryContents = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     // Verify main category exists
// //     const { data: mainCategory, error: categoryError } = await supabase
// //       .from('lesson_categories')
// //       .select('*')
// //       .eq('id', id)
// //       .eq('is_main_category', true)
// //       .maybeSingle();

// //     if (categoryError || !mainCategory) {
// //       return res.status(404).json({ success: false, message: 'Main category not found' });
// //     }

// //     // Get subcategories under this main category
// //     const { data: subcategories } = await supabase
// //       .from('lesson_categories')
// //       .select('*')
// //       .eq('parent_category_id', id)
// //       .order('order_index');

// //     // Get direct lessons under this main category
// //     const { data: lessons } = await supabase
// //       .from('lessons')
// //       .select('id, title, description, image_url, stars_reward, level')
// //       .eq('category_id', id)
// //       .order('created_at');

// //     // Combine into items array with type field
// //     const items = [
// //       ...(subcategories || []).map(c => ({
// //         type: 'category',
// //         id: c.id,
// //         name: c.name,
// //         description: c.description,
// //         imageUrl: c.image_url,
// //         level: c.level,
// //         orderIndex: c.order_index
// //       })),
// //       ...(lessons || []).map(l => ({
// //         type: 'lesson',
// //         id: l.id,
// //         title: l.title,
// //         description: l.description,
// //         imageUrl: l.image_url,
// //         starsReward: l.stars_reward,
// //         level: l.level
// //       }))
// //     ];

// //     res.status(200).json({
// //       id: mainCategory.id,
// //       name: mainCategory.name,
// //       description: mainCategory.description,
// //       imageUrl: mainCategory.image_url,
// //       level: mainCategory.level,
// //       items
// //     });
// //   } catch (error) {
// //     console.error('Get main category contents error:', error);
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };

// // /**
// //  * Get lessons in a subcategory
// //  */
// // const getSubcategoryLessons = async (req, res) => {
// //   try {
// //     const { mainCategoryId, subcategoryId } = req.params;

// //     // Verify main category exists
// //     const { data: mainCategory } = await supabase
// //       .from('lesson_categories')
// //       .select('id')
// //       .eq('id', mainCategoryId)
// //       .eq('is_main_category', true)
// //       .maybeSingle();

// //     if (!mainCategory) {
// //       return res.status(404).json({ success: false, message: 'Main category not found' });
// //     }

// //     // Verify subcategory exists and belongs to main category
// //     const { data: subcategory, error: subcategoryError } = await supabase
// //       .from('lesson_categories')
// //       .select('*')
// //       .eq('id', subcategoryId)
// //       .eq('parent_category_id', mainCategoryId)
// //       .maybeSingle();

// //     if (subcategoryError || !subcategory) {
// //       return res.status(404).json({ success: false, message: 'Subcategory not found in this main category' });
// //     }

// //     // Get lessons in subcategory
// //     const { data: lessons, error: lessonsError } = await supabase
// //       .from('lessons')
// //       .select('id, title, description, image_url, stars_reward, level')
// //       .eq('category_id', subcategoryId)
// //       .order('created_at');

// //     if (lessonsError) {
// //       return res.status(500).json({ success: false, message: 'Failed to fetch lessons' });
// //     }

// //     // Return items with type
// //     const items = (lessons || []).map(l => ({
// //       type: 'lesson',
// //       id: l.id,
// //       title: l.title,
// //       description: l.description,
// //       imageUrl: l.image_url,
// //       starsReward: l.stars_reward,
// //       level: l.level
// //     }));

// //     res.status(200).json({
// //       id: subcategory.id,
// //       name: subcategory.name,
// //       description: subcategory.description,
// //       imageUrl: subcategory.image_url,
// //       level: subcategory.level,
// //       items
// //     });
// //   } catch (error) {
// //     console.error('Get subcategory lessons error:', error);
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };

// // /**
// //  * Get lesson detail
// //  */
// // const getLessonDetail = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     const { data: lesson, error } = await supabase
// //       .from('lessons')
// //       .select('*')
// //       .eq('id', id)
// //       .single();

// //     if (error) {
// //       return res.status(404).json({ success: false, message: 'Lesson not found' });
// //     }

// //     const { data: allLessons } = await supabase
// //       .from('lessons')
// //       .select('id, order_index')
// //       .eq('category_id', lesson.category_id)
// //       .order('order_index');

// //     const currentIndex = allLessons.findIndex(l => l.id === id);
// //     const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
// //     const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

// //     res.status(200).json({
// //       id: lesson.id,
// //       title: lesson.title,
// //       description: lesson.description,
// //       audioUrl: lesson.audio_url,
// //       imageUrl: lesson.image_url,
// //       videoUrl: lesson.video_url,
// //       starsReward: lesson.stars_reward,
// //       level: lesson.level,
// //       navigation: {
// //         previousLessonId: previousLesson?.id || null,
// //         nextLessonId: nextLesson?.id || null,
// //         isFirst: currentIndex === 0,
// //         isLast: currentIndex === allLessons.length - 1
// //       }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };

// // /**
// //  * Complete lesson
// //  */
// // const completeLesson = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const childId = req.user.id;

// //     const { data: lesson } = await supabase
// //       .from('lessons')
// //       .select('stars_reward')
// //       .eq('id', id)
// //       .maybeSingle();

// //     if (!lesson) {
// //       return res.status(404).json({ success: false, message: 'Lesson not found' });
// //     }

// //     const { data: existing } = await supabase
// //       .from('lesson_completions')
// //       .select('id')
// //       .eq('child_id', childId)
// //       .eq('lesson_id', id)
// //       .maybeSingle();

// //     if (existing) {
// //       return res.status(409).json({ success: false, message: 'Lesson already completed' });
// //     }

// //     const { error: completionError } = await supabase
// //       .from('lesson_completions')
// //       .insert({
// //         child_id: childId,
// //         lesson_id: id,
// //         stars_earned: lesson.stars_reward
// //       });

// //     if (completionError) {
// //       console.error('Lesson completion error:', completionError);
// //       return res.status(500).json({ success: false, message: 'Failed to mark lesson complete', error: completionError.message });
// //     }

// //     const { data: child } = await supabase
// //       .from('children')
// //       .select('total_stars, current_streak, max_streak, last_activity_date')
// //       .eq('id', childId)
// //       .single();

// //     const newStars = child.total_stars + lesson.stars_reward;
// //     const now = new Date();
// //     const today = now.toISOString().split('T')[0];
// //     let newStreak = child.current_streak;

// //     if (child.last_activity_date) {
// //       const lastActivity = new Date(child.last_activity_date);
// //       const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);

// //       if (hoursSinceActivity > 24) {
// //         newStreak = 1;
// //       } else if (child.last_activity_date !== today) {
// //         const yesterday = new Date();
// //         yesterday.setDate(yesterday.getDate() - 1);
// //         const yesterdayStr = yesterday.toISOString().split('T')[0];

// //         if (child.last_activity_date === yesterdayStr) {
// //           newStreak += 1;
// //         } else {
// //           newStreak = 1;
// //         }
// //       }
// //     } else {
// //       newStreak = 1;
// //     }

// //     const newMaxStreak = Math.max(child.max_streak || 0, newStreak);

// //     await supabase
// //       .from('children')
// //       .update({
// //         total_stars: newStars,
// //         current_streak: newStreak,
// //         max_streak: newMaxStreak,
// //         last_activity_date: now.toISOString()
// //       })
// //       .eq('id', childId);

// //     const { data: completedCount } = await supabase
// //       .from('lesson_completions')
// //       .select('id', { count: 'exact' })
// //       .eq('child_id', childId);

// //     const { data: totalLessons } = await supabase
// //       .from('lessons')
// //       .select('id', { count: 'exact' })
// //       .eq('level', child.level || 1);

// //     const { data: sfx } = await supabase
// //       .from('sfx')
// //       .select('id')
// //       .limit(1)
// //       .maybeSingle();

// //     res.status(200).json({
// //       success: true,
// //       starsEarned: lesson.stars_reward,
// //       celebration: {
// //         sfxId: sfx?.id || null
// //       },
// //       newProgress: {
// //         currentLevel: child.level || 1,
// //         levelProgress: {
// //           completedInLevel: completedCount?.length || 0,
// //           totalInLevel: totalLessons?.length || 10,
// //           percentage: Math.round(((completedCount?.length || 0) / (totalLessons?.length || 10)) * 100)
// //         },
// //         totalStars: newStars,
// //         currentStreak: newStreak
// //       }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };

// // module.exports = {
// //   getMainCategories,
// //   getMainCategoryContents,
// //   getSubcategoryLessons,
// //   getLessonDetail,
// //   completeLesson
// // };




// const supabase = require('../config/supabase');
// const { checkAndPromoteLevel } = require('../utils/levelManager');

// const getMainCategories = async (req, res) => {
//   try {
//     const { data: categories, error } = await supabase
//       .from('lesson_categories')
//       .select('*')
//       .eq('is_main_category', true)
//       .order('order_index');

//     if (error) {
//       return res.status(500).json({ success: false, message: 'Failed to fetch main categories' });
//     }

//     res.status(200).json({
//       categories: (categories || []).map(c => ({
//         id: c.id,
//         title: c.title,
//         description: c.description,
//         imageUrl: c.image_url,
//         level: c.level,
//         orderIndex: c.order_index
//       }))
//     });
//   } catch (error) {
//     console.error('Get main categories error:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// const getMainCategoryContents = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Verify main category exists
//     const { data: mainCategory, error: categoryError } = await supabase
//       .from('lesson_categories')
//       .select('*')
//       .eq('id', id)
//       .eq('is_main_category', true)
//       .maybeSingle();

//     if (categoryError || !mainCategory) {
//       return res.status(404).json({ success: false, message: 'Main category not found' });
//     }

//     // Get subcategories under this main category
//     const { data: subcategories } = await supabase
//       .from('lesson_categories')
//       .select('*')
//       .eq('parent_category_id', id)
//       .order('order_index');

//     // Get direct lessons under this main category
//     const { data: lessons } = await supabase
//       .from('lessons')
//       .select('id, title, description, image_url, stars_reward, level')
//       .eq('category_id', id)
//       .order('created_at');

//     // Combine into items array with type field
//     const items = [
//       ...(subcategories || []).map(c => ({
//         type: 'category',
//         id: c.id,
//         title: c.title,
//         description: c.description,
//         imageUrl: c.image_url,
//         level: c.level,
//         orderIndex: c.order_index
//       })),
//       ...(lessons || []).map(l => ({
//         type: 'lesson',
//         id: l.id,
//         title: l.title,
//         description: l.description,
//         imageUrl: l.image_url,
//         starsReward: l.stars_reward,
//         level: l.level
//       }))
//     ];

//     res.status(200).json({
//       id: mainCategory.id,
//       title: mainCategory.title,
//       description: mainCategory.description,
//       imageUrl: mainCategory.image_url,
//       level: mainCategory.level,
//       items
//     });
//   } catch (error) {
//     console.error('Get main category contents error:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// const getSubcategoryLessons = async (req, res) => {
//   try {
//     const { mainCategoryId, subcategoryId } = req.params;

//     // Verify main category exists
//     const { data: mainCategory } = await supabase
//       .from('lesson_categories')
//       .select('id')
//       .eq('id', mainCategoryId)
//       .eq('is_main_category', true)
//       .maybeSingle();

//     if (!mainCategory) {
//       return res.status(404).json({ success: false, message: 'Main category not found' });
//     }

//     // Verify subcategory exists and belongs to main category
//     const { data: subcategory, error: subcategoryError } = await supabase
//       .from('lesson_categories')
//       .select('*')
//       .eq('id', subcategoryId)
//       .eq('parent_category_id', mainCategoryId)
//       .maybeSingle();

//     if (subcategoryError || !subcategory) {
//       return res.status(404).json({ success: false, message: 'Subcategory not found in this main category' });
//     }

//     // Get lessons in subcategory
//     const { data: lessons, error: lessonsError } = await supabase
//       .from('lessons')
//       .select('id, title, description, image_url, stars_reward, level')
//       .eq('category_id', subcategoryId)
//       .order('created_at');

//     if (lessonsError) {
//       return res.status(500).json({ success: false, message: 'Failed to fetch lessons' });
//     }

//     // Return items with type
//     const items = (lessons || []).map(l => ({
//       type: 'lesson',
//       id: l.id,
//       title: l.title,
//       description: l.description,
//       imageUrl: l.image_url,
//       starsReward: l.stars_reward,
//       level: l.level
//     }));

//     res.status(200).json({
//       id: subcategory.id,
//       title: subcategory.title,
//       description: subcategory.description,
//       imageUrl: subcategory.image_url,
//       level: subcategory.level,
//       items
//     });
//   } catch (error) {
//     console.error('Get subcategory lessons error:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// const getLessonDetail = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const { data: lesson, error } = await supabase
//       .from('lessons')
//       .select('*')
//       .eq('id', id)
//       .single();

//     if (error) {
//       return res.status(404).json({ success: false, message: 'Lesson not found' });
//     }

//     const { data: allLessons } = await supabase
//       .from('lessons')
//       .select('id, order_index')
//       .eq('category_id', lesson.category_id)
//       .order('order_index');

//     const currentIndex = allLessons.findIndex(l => l.id === id);
//     const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
//     const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

//     res.status(200).json({
//       id: lesson.id,
//       title: lesson.title,
//       description: lesson.description,
//       audioUrl: lesson.audio_url,
//       imageUrl: lesson.image_url,
//       videoUrl: lesson.video_url,
//       starsReward: lesson.stars_reward,
//       level: lesson.level,
//       navigation: {
//         previousLessonId: previousLesson?.id || null,
//         nextLessonId: nextLesson?.id || null,
//         isFirst: currentIndex === 0,
//         isLast: currentIndex === allLessons.length - 1
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// /**
//  * Complete lesson
//  */

// // const completeLesson = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const childId = req.user.id;
// //     // Removed authClient to prevent "No suitable key" error

// //     const { data: lesson } = await supabase
// //       .from('lessons')
// //       .select('title, stars_reward, category_id')
// //       .eq('id', id)
// //       .maybeSingle();

// //     if (!lesson) {
// //       return res.status(404).json({ success: false, message: 'Lesson not found' });
// //     }

// //     const { data: existing } = await supabase
// //       .from('lesson_completions')
// //       .select('id')
// //       .eq('child_id', childId)
// //       .eq('lesson_id', id)
// //       .maybeSingle();

// //     if (existing) {
// //       return res.status(409).json({ success: false, message: 'Lesson already completed' });
// //     }

// //     // 1. Mark lesson complete using standard supabase client
// //     const { error: completionError } = await supabase
// //       .from('lesson_completions')
// //       .insert({
// //         child_id: childId,
// //         lesson_id: id,
// //         stars_earned: lesson.stars_reward
// //       });

// //     if (completionError) {
// //       console.error('Lesson completion error:', completionError);
// //       return res.status(500).json({ success: false, message: 'Failed to mark lesson complete', error: completionError.message });
// //     }

// //     const { data: child } = await supabase
// //       .from('children')
// //       .select('total_stars, current_streak, max_streak, last_activity_date, display_name, level')
// //       .eq('id', childId)
// //       .single();

// //     const newStars = child.total_stars + lesson.stars_reward;
    
// //     // 2. FIX: Robust Streak Calculation
// //     const now = new Date();
// //     const lastActivity = new Date(child.last_activity_date || 0);
    
// //     // Normalize to midnight to compare just dates (ignoring time)
// //     const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
// //     const lastActivityDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
    
// //     const diffTime = Math.abs(todayDate.getTime() - lastActivityDate.getTime());
// //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

// //     let newStreak = child.current_streak || 0;

// //     if (diffDays === 1) {
// //         // Consecutive day: increment streak
// //         newStreak += 1;
// //     } else if (diffDays > 1) {
// //         // Missed one or more days: reset streak (start at 1)
// //         newStreak = 1;
// //     } else if (diffDays === 0) {
// //         // Same day: If streak is 0 (first activity today after fresh signup/reset), set to 1.
// //         if (newStreak === 0) {
// //             newStreak = 1;
// //         }
// //     } else {
// //         // Fallback for weird dates
// //         newStreak = 1;
// //     }

// //     const newMaxStreak = Math.max(child.max_streak || 0, newStreak);

// //     // Update child stats
// //     await supabase
// //       .from('children')
// //       .update({
// //         total_stars: newStars,
// //         current_streak: newStreak,
// //         max_streak: newMaxStreak,
// //         last_activity_date: now.toISOString()
// //       })
// //       .eq('id', childId);

// //     // 3. Insert Notification
// //     await supabase.from('child_notifications').insert({
// //         child_id: childId,
// //         type: 'lesson_completed',
// //         title: 'Lesson Completed!',
// //         message: `You completed ${lesson.title} and earned ${lesson.stars_reward} stars!`,
// //         read: false
// //     });

// //     // 4. Achievement Check
// //     // Example: Award 'First Steps' for first lesson completed
// //     const { count: completedCountTotal } = await supabase
// //       .from('lesson_completions')
// //       .select('id', { count: 'exact' })
// //       .eq('child_id', childId);
    
// //     if (completedCountTotal === 1) {
// //         // Fetch specific achievement ID (assuming seeded)
// //         const { data: ach } = await supabase.from('achievements').select('id').eq('name', 'First Steps').maybeSingle();
// //         if (ach) {
// //             await supabase.from('child_achievements').insert({
// //                 child_id: childId,
// //                 achievement_id: ach.id
// //             }).catch(e => {}); // Ignore duplicate error
            
// //             // Insert notification for the achievement
// //              await supabase.from('child_notifications').insert({
// //                 child_id: childId,
// //                 type: 'achievement_unlocked',
// //                 title: 'Achievement Unlocked!',
// //                 message: 'You earned the First Steps badge!',
// //                 read: false
// //              });
// //         }
// //     }

// //     const { count: completedCount } = await supabase
// //       .from('lesson_completions')
// //       .select('id', { count: 'exact' })
// //       .eq('child_id', childId)
// //       .eq('level', child.level || 1);

// //     const { count: totalLessons } = await supabase
// //       .from('lessons')
// //       .select('id', { count: 'exact' })
// //       .eq('level', child.level || 1);

// //     const totalLessonsInLevel = totalLessons || 1;

// //     const { data: sfx } = await supabase
// //       .from('sfx')
// //       .select('id')
// //       .limit(1)
// //       .maybeSingle();

// //     res.status(200).json({
// //       success: true,
// //       starsEarned: lesson.stars_reward,
// //       celebration: {
// //         sfxId: sfx?.id || null
// //       },
// //       newProgress: {
// //         currentLevel: child.level || 1,
// //         levelProgress: {
// //           completedInLevel: completedCount || 0,
// //           totalInLevel: totalLessonsInLevel,
// //           percentage: Math.round(((completedCount || 0) / totalLessonsInLevel) * 100)
// //         },
// //         totalStars: newStars,
// //         currentStreak: newStreak
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Complete lesson error:', error);
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };


// // complete lesson with new level up logic
// const completeLesson = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const childId = req.user.id;
//     // Removed authClient to prevent "No suitable key" error

//     const { data: lesson } = await supabase
//       .from('lessons')
//       .select('title, stars_reward, category_id')
//       .eq('id', id)
//       .maybeSingle();

//     if (!lesson) {
//       return res.status(404).json({ success: false, message: 'Lesson not found' });
//     }

//     const { data: existing } = await supabase
//       .from('lesson_completions')
//       .select('id')
//       .eq('child_id', childId)
//       .eq('lesson_id', id)
//       .maybeSingle();

//     if (existing) {
//       return res.status(409).json({ success: false, message: 'Lesson already completed' });
//     }

//     // 1. Mark lesson complete using standard supabase client
//     const { error: completionError } = await supabase
//       .from('lesson_completions')
//       .insert({
//         child_id: childId,
//         lesson_id: id,
//         stars_earned: lesson.stars_reward
//       });

//     if (completionError) {
//       console.error('Lesson completion error:', completionError);
//       return res.status(500).json({ success: false, message: 'Failed to mark lesson complete', error: completionError.message });
//     }

//     const { data: child } = await supabase
//       .from('children')
//       .select('total_stars, current_streak, max_streak, last_activity_date, display_name, level')
//       .eq('id', childId)
//       .single();

//     const newStars = child.total_stars + lesson.stars_reward;
    
//     // 2. FIX: Robust Streak Calculation
//     const now = new Date();
//     const lastActivity = new Date(child.last_activity_date || 0);
    
//     // Normalize to midnight to compare just dates (ignoring time)
//     const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const lastActivityDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
    
//     const diffTime = Math.abs(todayDate.getTime() - lastActivityDate.getTime());
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

//     let newStreak = child.current_streak || 0;

//     if (diffDays === 1) {
//         // Consecutive day: increment streak
//         newStreak += 1;
//     } else if (diffDays > 1) {
//         // Missed one or more days: reset streak (start at 1)
//         newStreak = 1;
//     } else if (diffDays === 0) {
//         // Same day: If streak is 0 (first activity today after fresh signup/reset), set to 1.
//         if (newStreak === 0) {
//             newStreak = 1;
//         }
//     } else {
//         // Fallback for weird dates
//         newStreak = 1;
//     }

//     const newMaxStreak = Math.max(child.max_streak || 0, newStreak);

//     // Update child stats
//     await supabase
//       .from('children')
//       .update({
//         total_stars: newStars,
//         current_streak: newStreak,
//         max_streak: newMaxStreak,
//         last_activity_date: now.toISOString()
//       })
//       .eq('id', childId);

//     // 3. Insert Notification
//     await supabase.from('child_notifications').insert({
//         child_id: childId,
//         type: 'lesson_completed',
//         title: 'Lesson Completed!',
//         message: `You completed ${lesson.title} and earned ${lesson.stars_reward} stars!`,
//         read: false
//     });

//     // 4. Achievement Check
//     // Example: Award 'First Steps' for first lesson completed
//     const { count: completedCountTotal } = await supabase
//       .from('lesson_completions')
//       .select('id', { count: 'exact' })
//       .eq('child_id', childId);
    
//     if (completedCountTotal === 1) {
//         // Fetch specific achievement ID (assuming seeded)
//         const { data: ach } = await supabase.from('achievements').select('id').eq('name', 'First Steps').maybeSingle();
//         if (ach) {
//             await supabase.from('child_achievements').insert({
//                 child_id: childId,
//                 achievement_id: ach.id
//             }).catch(e => {}); // Ignore duplicate error
            
//             // Insert notification for the achievement
//              await supabase.from('child_notifications').insert({
//                 child_id: childId,
//                 type: 'achievement_unlocked',
//                 title: 'Achievement Unlocked!',
//                 message: 'You earned the First Steps badge!',
//                 read: false
//              });
//         }
//     }

//     // 5. Level Promotion Check
//     const promotionResult = await checkAndPromoteLevel(childId);
//     let finalLevel = child.level || 1;
    
//     if (promotionResult.promoted) {
//         finalLevel = promotionResult.newLevel;
        
//         await supabase.from('child_notifications').insert({
//           child_id: childId,
//           type: 'level_up',
//           title: 'Level Up!',
//           message: `Congratulations! You have promoted to Level ${finalLevel}!`,
//           read: false
//         });
//     }

//     const { count: completedCount } = await supabase
//       .from('lesson_completions')
//       .select('id', { count: 'exact' })
//       .eq('child_id', childId)
//       .eq('level', finalLevel);

//     const { count: totalLessons } = await supabase
//       .from('lessons')
//       .select('id', { count: 'exact' })
//       .eq('level', finalLevel);

//     const totalLessonsInLevel = totalLessons || 1;

//     const { data: sfx } = await supabase
//       .from('sfx')
//       .select('id')
//       .limit(1)
//       .maybeSingle();

//     res.status(200).json({
//       success: true,
//       starsEarned: lesson.stars_reward,
//       celebration: {
//         sfxId: sfx?.id || null
//       },
//       newProgress: {
//         currentLevel: finalLevel,
//         levelUp: promotionResult.promoted,
//         levelProgress: {
//           completedInLevel: completedCount || 0,
//           totalInLevel: totalLessonsInLevel,
//           percentage: Math.round(((completedCount || 0) / totalLessonsInLevel) * 100)
//         },
//         totalStars: newStars,
//         currentStreak: newStreak
//       }
//     });
//   } catch (error) {
//     console.error('Complete lesson error:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// module.exports = {
//   getMainCategories,
//   getMainCategoryContents,
//   getSubcategoryLessons,
//   getLessonDetail,
//   completeLesson
// };




const supabase = require('../config/supabase');
const { checkAndPromoteLevel } = require('../utils/levelManager');

const getMainCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('lesson_categories')
      .select('*')
      .eq('is_main_category', true)
      .order('order_index');

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch main categories' });
    }

    res.status(200).json({
      categories: (categories || []).map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        imageUrl: c.image_url,
        level: c.level,
        orderIndex: c.order_index
      }))
    });
  } catch (error) {
    console.error('Get main categories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getMainCategoryContents = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify main category exists
    const { data: mainCategory, error: categoryError } = await supabase
      .from('lesson_categories')
      .select('*')
      .eq('id', id)
      .eq('is_main_category', true)
      .maybeSingle();

    if (categoryError || !mainCategory) {
      return res.status(404).json({ success: false, message: 'Main category not found' });
    }

    // Get subcategories under this main category
    const { data: subcategories } = await supabase
      .from('lesson_categories')
      .select('*')
      .eq('parent_category_id', id)
      .order('order_index');

    // Get direct lessons under this main category
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, description, image_url, stars_reward, level')
      .eq('category_id', id)
      .order('created_at');

    // Combine into items array with type field
    const items = [
      ...(subcategories || []).map(c => ({
        type: 'category',
        id: c.id,
        name: c.name,
        description: c.description,
        imageUrl: c.image_url,
        level: c.level,
        orderIndex: c.order_index
      })),
      ...(lessons || []).map(l => ({
        type: 'lesson',
        id: l.id,
        title: l.title,
        description: l.description,
        imageUrl: l.image_url,
        starsReward: l.stars_reward,
        level: l.level
      }))
    ];

    res.status(200).json({
      id: mainCategory.id,
      name: mainCategory.name,
      description: mainCategory.description,
      imageUrl: mainCategory.image_url,
      level: mainCategory.level,
      items
    });
  } catch (error) {
    console.error('Get main category contents error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getSubcategoryLessons = async (req, res) => {
  try {
    const { mainCategoryId, subcategoryId } = req.params;

    // Verify main category exists
    const { data: mainCategory } = await supabase
      .from('lesson_categories')
      .select('id')
      .eq('id', mainCategoryId)
      .eq('is_main_category', true)
      .maybeSingle();

    if (!mainCategory) {
      return res.status(404).json({ success: false, message: 'Main category not found' });
    }

    // Verify subcategory exists and belongs to main category
    const { data: subcategory, error: subcategoryError } = await supabase
      .from('lesson_categories')
      .select('*')
      .eq('id', subcategoryId)
      .eq('parent_category_id', mainCategoryId)
      .maybeSingle();

    if (subcategoryError || !subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found in this main category' });
    }

    // Get lessons in subcategory
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, description, image_url, stars_reward, level')
      .eq('category_id', subcategoryId)
      .order('created_at');

    if (lessonsError) {
      return res.status(500).json({ success: false, message: 'Failed to fetch lessons' });
    }

    // Return items with type
    const items = (lessons || []).map(l => ({
      type: 'lesson',
      id: l.id,
      title: l.title,
      description: l.description,
      imageUrl: l.image_url,
      starsReward: l.stars_reward,
      level: l.level
    }));

    res.status(200).json({
      id: subcategory.id,
      name: subcategory.name,
      description: subcategory.description,
      imageUrl: subcategory.image_url,
      level: subcategory.level,
      items
    });
  } catch (error) {
    console.error('Get subcategory lessons error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getLessonDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id, order_index')
      .eq('category_id', lesson.category_id)
      .order('order_index');

    const currentIndex = allLessons.findIndex(l => l.id === id);
    const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    res.status(200).json({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      audioUrl: lesson.audio_url,
      imageUrl: lesson.image_url,
      videoUrl: lesson.video_url,
      starsReward: lesson.stars_reward,
      level: lesson.level,
      navigation: {
        previousLessonId: previousLesson?.id || null,
        nextLessonId: nextLesson?.id || null,
        isFirst: currentIndex === 0,
        isLast: currentIndex === allLessons.length - 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Complete lesson
 */
const completeLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const childId = req.user.id;
    // Removed authClient to prevent "No suitable key" error

    const { data: lesson } = await supabase
      .from('lessons')
      .select('title, stars_reward, category_id')
      .eq('id', id)
      .maybeSingle();

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const { data: existing } = await supabase
      .from('lesson_completions')
      .select('id')
      .eq('child_id', childId)
      .eq('lesson_id', id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, message: 'Lesson already completed' });
    }

    // 1. Mark lesson complete using standard supabase client
    const { error: completionError } = await supabase
      .from('lesson_completions')
      .insert({
        child_id: childId,
        lesson_id: id,
        stars_earned: lesson.stars_reward
      });

    if (completionError) {
      console.error('Lesson completion error:', completionError);
      return res.status(500).json({ success: false, message: 'Failed to mark lesson complete', error: completionError.message });
    }

    const { data: child } = await supabase
      .from('children')
      .select('total_stars, current_streak, max_streak, last_activity_date, display_name, level')
      .eq('id', childId)
      .single();

    const newStars = child.total_stars + lesson.stars_reward;
    
    // 2. FIX: Robust Streak Calculation
    const now = new Date();
    const lastActivity = new Date(child.last_activity_date || 0);
    
    // Normalize to midnight to compare just dates (ignoring time)
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActivityDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
    
    const diffTime = Math.abs(todayDate.getTime() - lastActivityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    let newStreak = child.current_streak || 0;

    if (diffDays === 1) {
        // Consecutive day: increment streak
        newStreak += 1;
    } else if (diffDays > 1) {
        // Missed one or more days: reset streak (start at 1)
        newStreak = 1;
    } else if (diffDays === 0) {
        // Same day: If streak is 0 (first activity today after fresh signup/reset), set to 1.
        if (newStreak === 0) {
            newStreak = 1;
        }
    } else {
        // Fallback for weird dates
        newStreak = 1;
    }

    const newMaxStreak = Math.max(child.max_streak || 0, newStreak);

    // Update child stats
    await supabase
      .from('children')
      .update({
        total_stars: newStars,
        current_streak: newStreak,
        max_streak: newMaxStreak,
        last_activity_date: now.toISOString()
      })
      .eq('id', childId);

    // 3. Insert Notification
    await supabase.from('child_notifications').insert({
        child_id: childId,
        type: 'lesson_completed',
        title: 'Lesson Completed!',
        message: `You completed ${lesson.title} and earned ${lesson.stars_reward} stars!`,
        read: false
    });

    // 4. Achievement Check
    // Example: Award 'First Steps' for first lesson completed
    const { count: completedCountTotal } = await supabase
      .from('lesson_completions')
      .select('id', { count: 'exact' })
      .eq('child_id', childId);
    
    if (completedCountTotal === 1) {
        // Fetch specific achievement ID (assuming seeded)
        const { data: ach } = await supabase.from('achievements').select('id').eq('name', 'First Steps').maybeSingle();
        if (ach) {
            await supabase.from('child_achievements').insert({
                child_id: childId,
                achievement_id: ach.id
            }).catch(e => {}); // Ignore duplicate error
            
            // Insert notification for the achievement
             await supabase.from('child_notifications').insert({
                child_id: childId,
                type: 'achievement_unlocked',
                title: 'Achievement Unlocked!',
                message: 'You earned the First Steps badge!',
                read: false
             });
        }
    }

    // 5. Level Promotion Check
    const promotionResult = await checkAndPromoteLevel(childId);
    let finalLevel = child.level || 1;
    
    if (promotionResult.promoted) {
        finalLevel = promotionResult.newLevel;
        
        await supabase.from('child_notifications').insert({
          child_id: childId,
          type: 'level_up',
          title: 'Level Up!',
          message: `Congratulations! You have promoted to Level ${finalLevel}!`,
          read: false
        });
    }

    const { count: completedCount } = await supabase
      .from('lesson_completions')
      .select('id', { count: 'exact' })
      .eq('child_id', childId)
      .eq('level', finalLevel);

    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('id', { count: 'exact' })
      .eq('level', finalLevel);

    const totalLessonsInLevel = totalLessons || 1;

    const { data: sfx } = await supabase
      .from('sfx')
      .select('id')
      .limit(1)
      .maybeSingle();

    res.status(200).json({
      success: true,
      starsEarned: lesson.stars_reward,
      celebration: {
        sfxId: sfx?.id || null
      },
      newProgress: {
        currentLevel: finalLevel,
        levelUp: promotionResult.promoted,
        levelProgress: {
          completedInLevel: completedCount || 0,
          totalInLevel: totalLessonsInLevel,
          percentage: Math.round(((completedCount || 0) / totalLessonsInLevel) * 100)
        },
        totalStars: newStars,
        currentStreak: newStreak
      }
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getMainCategories,
  getMainCategoryContents,
  getSubcategoryLessons,
  getLessonDetail,
  completeLesson
};