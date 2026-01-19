// // const supabase = require('../config/supabase');

// // const getChallengeCategories = async (req, res) => {
// //   try {
// //     const { level, childId } = req.query;

// //     if (!level || !childId) {
// //       return res.status(400).json({ success: false, message: 'level and childId are required' });
// //     }

// //     const { data: categories, error } = await supabase
// //       .from('challenge_categories')
// //       .select('*, challenge_questions(id)')
// //       .eq('level', parseInt(level))
// //       .eq('is_published', true);

// //     if (error) {
// //       return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
// //     }

// //     const { data: child } = await supabase
// //       .from('children')
// //       .select('level')
// //       .eq('id', childId)
// //       .single();

// //     // Check which categories have been completed
// //     const { data: completedSessions } = await supabase
// //       .from('attempt_sessions')
// //       .select('category_id')
// //       .eq('child_id', childId)
// //       .eq('status', 'completed')
// //       .eq('passed', true);

// //     const completedCategoryIds = new Set((completedSessions || []).map(s => s.category_id));

// //     const categoriesWithLock = (categories || []).map(cat => ({
// //       id: cat.id,
// //       name: cat.name,
// //       level: cat.level,
// //       isLocked: cat.level > (child?.level || 1),
// //       isCompleted: completedCategoryIds.has(cat.id),
// //       questionCount: cat.challenge_questions?.length || 0,
// //       unlockRequirement: cat.level > (child?.level || 1)
// //         ? `Complete all challenges in Level ${cat.level - 1} to unlock.`
// //         : 'Complete all challenges in the previous level to unlock.'
// //     }));

// //     res.status(200).json({ categories: categoriesWithLock });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };

// // const startSession = async (req, res) => {
// //   try {
// //     const { challengeCategoryId } = req.body;
// //     const childId = req.user.id;

// //     if (!challengeCategoryId) {
// //       return res.status(400).json({ success: false, message: 'challengeCategoryId is required' });
// //     }

// //     const { data: category } = await supabase
// //       .from('challenge_categories')
// //       .select('level, is_published')
// //       .eq('id', challengeCategoryId)
// //       .single();

// //     if (!category || !category.is_published) {
// //       return res.status(403).json({ success: false, message: 'Challenge category is locked or not found' });
// //     }

// //     const { data: questions } = await supabase
// //       .from('challenge_questions')
// //       .select('id')
// //       .eq('category_id', challengeCategoryId);

// //     const { data: session, error } = await supabase
// //       .from('attempt_sessions')
// //       .insert({
// //         child_id: childId,
// //         category_id: challengeCategoryId,
// //         status: 'active'
// //       })
// //       .select()
// //       .single();

// //     if (error) {
// //       console.error('Start session error:', error);
// //       return res.status(500).json({ success: false, message: 'Failed to start session', error: error.message });
// //     }

// //     res.status(201).json({
// //       sessionId: session.id,
// //       message: 'Session started.',
// //       questionCount: questions?.length || 0
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };

// // const getNextQuestion = async (req, res) => {
// //   try {
// //     const { sessionId } = req.params;

// //     const { data: session } = await supabase
// //       .from('attempt_sessions')
// //       .select('category_id, status, child_id')
// //       .eq('id', sessionId)
// //       .single();

// //     if (!session || session.status !== 'active') {
// //       return res.status(404).json({ success: false, message: 'Session ended or all questions answered' });
// //     }

// //     const { data: answered } = await supabase
// //       .from('attempt_answers')
// //       .select('question_id, is_correct')
// //       .eq('session_id', sessionId);

// //     const correctlyAnsweredIds = (answered || []).filter(a => a.is_correct).map(a => a.question_id);

// //     // Get all questions in this category
// //     const { data: allQuestions } = await supabase
// //       .from('challenge_questions')
// //       .select('*')
// //       .eq('category_id', session.category_id)
// //       .order('order_index', { ascending: true });

// //     // Filter out correctly answered questions (allow retry on wrong answers)
// //     const unansweredQuestions = (allQuestions || []).filter(q => !correctlyAnsweredIds.includes(q.id));

// //     if (unansweredQuestions.length === 0) {
// //       // All questions answered - auto-finish session
// //       // Call finishSession logic inline
// //       const { data: answers } = await supabase
// //         .from('attempt_answers')
// //         .select('is_correct, time_taken_sec, score')
// //         .eq('session_id', sessionId);

// //       const totalQuestions = allQuestions.length;
// //       const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
// //       const percentage = Math.round((correctAnswers / totalQuestions) * 100);

// //       const baseScore = (answers || []).reduce((sum, a) => sum + (a.score || 0), 0);
// //       const totalTimeSec = (answers || []).reduce((sum, a) => sum + (a.time_taken_sec || 0), 0);

// //       const timePenalty = Math.floor(totalTimeSec / 10);
// //       const finalScore = Math.max(0, baseScore - timePenalty);

// //       const { data: category } = await supabase
// //         .from('challenge_categories')
// //         .select('pass_percentage')
// //         .eq('id', session.category_id)
// //         .single();

// //       const passed = percentage >= (category?.pass_percentage || 70);
// //       const starsEarned = passed ? Math.ceil(finalScore / 20) : 0;

// //       await supabase
// //         .from('attempt_sessions')
// //         .update({
// //           status: 'completed',
// //           final_score: finalScore,
// //           stars_earned: starsEarned,
// //           passed: passed,
// //           completed_at: new Date().toISOString()
// //         })
// //         .eq('id', sessionId);

// //       // Update child stats if passed
// //       if (passed) {
// //         const { data: child } = await supabase
// //           .from('children')
// //           .select('total_stars, current_streak, max_streak, last_activity_date')
// //           .eq('id', session.child_id)
// //           .single();

// //         const now = new Date();
// //         let newStreak = child.current_streak;

// //         if (child.last_activity_date) {
// //           const lastActivity = new Date(child.last_activity_date);
// //           const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);

// //           if (hoursSinceActivity > 24) {
// //             newStreak = 1;
// //           } else {
// //             const today = now.toISOString().split('T')[0];
// //             const lastActivityDate = new Date(child.last_activity_date).toISOString().split('T')[0];

// //             if (lastActivityDate !== today) {
// //               const yesterday = new Date();
// //               yesterday.setDate(yesterday.getDate() - 1);
// //               const yesterdayStr = yesterday.toISOString().split('T')[0];

// //               if (lastActivityDate === yesterdayStr) {
// //                 newStreak += 1;
// //               } else {
// //                 newStreak = 1;
// //               }
// //             }
// //           }
// //         } else {
// //           newStreak = 1;
// //         }

// //         const newMaxStreak = Math.max(child.max_streak || 0, newStreak);

// //         await supabase
// //           .from('children')
// //           .update({
// //             total_stars: (child?.total_stars || 0) + starsEarned,
// //             current_streak: newStreak,
// //             max_streak: newMaxStreak,
// //             last_activity_date: now.toISOString()
// //           })
// //           .eq('id', session.child_id);
// //       }

// //       return res.status(200).json({
// //         allQuestionsAnswered: true,
// //         autoFinished: true,
// //         sessionId,
// //         finalScore,
// //         scoring: {
// //           baseScore,
// //           timePenalty,
// //           finalScore
// //         },
// //         passed,
// //         starsEarned,
// //         correctAnswers,
// //         totalQuestions,
// //         percentage
// //       });
// //     }

// //     const question = unansweredQuestions[0];

// //     // Record question start time
// //     await supabase
// //       .from('attempt_answers')
// //       .insert({
// //         session_id: sessionId,
// //         question_id: question.id,
// //         time_started: new Date().toISOString(),
// //         is_correct: false,
// //         answer: null,
// //         score: 0,
// //         time_taken_sec: 0,
// //         attempt_number: 1
// //       });

// //     res.status(200).json({
// //       questionId: question.id,
// //       type: question.type,
// //       question: question.question,
// //       options: question.options,
// //       timeLimitSec: question.time_limit_sec
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };

// // const submitAnswer = async (req, res) => {
// //   try {
// //     const { sessionId } = req.params;
// //     const { questionId, answer } = req.body;

// //     if (!questionId || answer === undefined) {
// //       return res.status(400).json({ success: false, message: 'questionId and answer are required' });
// //     }

// //     const { data: question } = await supabase
// //       .from('challenge_questions')
// //       .select('answer, time_limit_sec')
// //       .eq('id', questionId)
// //       .maybeSingle();

// //     if (!question) {
// //       return res.status(404).json({ success: false, message: 'Question not found' });
// //     }

// //     // Get current attempt record
// //     const { data: existingAttempts } = await supabase
// //       .from('attempt_answers')
// //       .select('*')
// //       .eq('session_id', sessionId)
// //       .eq('question_id', questionId)
// //       .order('attempt_number', { ascending: false });

// //     const latestAttempt = existingAttempts && existingAttempts.length > 0 ? existingAttempts[0] : null;

// //     if (latestAttempt && latestAttempt.is_correct) {
// //       return res.status(409).json({ success: false, message: 'Question already answered correctly' });
// //     }

// //     const attemptNumber = latestAttempt ? latestAttempt.attempt_number + 1 : 1;
// //     const timeStarted = latestAttempt && latestAttempt.time_started
// //       ? new Date(latestAttempt.time_started)
// //       : new Date();

// //     const now = new Date();
// //     const timeTakenSec = Math.round((now - timeStarted) / 1000);

// //     const isCorrect = JSON.stringify(question.answer) === JSON.stringify(answer);

// //     let score = isCorrect ? 10 : 0;
// //     let timePenalty = 0;
// //     let repeatPenalty = 0;

// //     // Calculate time penalty if exceeded time limit
// //     if (question.time_limit_sec && timeTakenSec > question.time_limit_sec) {
// //       const extraTime = timeTakenSec - question.time_limit_sec;
// //       timePenalty = Math.min(5, Math.floor(extraTime / 10));
// //     }

// //     // Calculate repeat attempt penalty
// //     if (attemptNumber > 1) {
// //       repeatPenalty = (attemptNumber - 1) * 2;
// //     }

// //     score = Math.max(0, score - timePenalty - repeatPenalty);

// //     // Delete previous attempts for this question if answer is wrong
// //     if (!isCorrect && latestAttempt) {
// //       await supabase
// //         .from('attempt_answers')
// //         .delete()
// //         .eq('session_id', sessionId)
// //         .eq('question_id', questionId);
// //     }

// //     // Insert new attempt
// //     const { error } = await supabase
// //       .from('attempt_answers')
// //       .insert({
// //         session_id: sessionId,
// //         question_id: questionId,
// //         answer: answer,
// //         is_correct: isCorrect,
// //         time_taken_sec: timeTakenSec,
// //         score: score,
// //         attempt_number: attemptNumber,
// //         time_started: timeStarted.toISOString(),
// //         time_penalty: timePenalty,
// //         repeat_penalty: repeatPenalty
// //       });

// //     if (error) {
// //       console.error('Submit answer error:', error);
// //       return res.status(500).json({ success: false, message: 'Failed to submit answer', error: error.message });
// //     }

// //     res.status(200).json({
// //       correct: isCorrect,
// //       score: score,
// //       timeTakenSec: timeTakenSec,
// //       attemptNumber,
// //       penalties: {
// //         timePenalty,
// //         repeatPenalty
// //       },
// //       canRetry: !isCorrect
// //     });
// //   } catch (error) {
// //     console.error('Exception in submitAnswer:', error);
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };

// // const finishSession = async (req, res) => {
// //   try {
// //     const { sessionId } = req.params;

// //     const { data: session } = await supabase
// //       .from('attempt_sessions')
// //       .select('child_id, category_id')
// //       .eq('id', sessionId)
// //       .single();

// //     if (!session) {
// //       return res.status(404).json({ success: false, message: 'Session not found' });
// //     }

// //     const { data: answers } = await supabase
// //       .from('attempt_answers')
// //       .select('score, is_correct, time_penalty, repeat_penalty')
// //       .eq('session_id', sessionId);

// //     const baseScore = answers?.reduce((sum, a) => sum + a.score, 0) || 0;
// //     const totalQuestions = answers?.length || 1;
// //     const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
// //     const percentage = Math.round((correctAnswers / totalQuestions) * 100);

// //     const timePenalty = answers?.reduce((sum, a) => sum + (a.time_penalty || 0), 0) || 0;
// //     const repeatAttemptPenalty = answers?.reduce((sum, a) => sum + (a.repeat_penalty || 0), 0) || 0;
// //     const finalScore = Math.max(0, baseScore - timePenalty - repeatAttemptPenalty);

// //     const { data: category } = await supabase
// //       .from('challenge_categories')
// //       .select('pass_percentage')
// //       .eq('id', session.category_id)
// //       .single();

// //     const passed = percentage >= (category?.pass_percentage || 70);
// //     const starsEarned = passed ? Math.ceil(finalScore / 20) : 0;

// //     await supabase
// //       .from('attempt_sessions')
// //       .update({
// //         status: 'completed',
// //         final_score: finalScore,
// //         stars_earned: starsEarned,
// //         passed: passed,
// //         completed_at: new Date().toISOString()
// //       })
// //       .eq('id', sessionId);

// //     if (passed) {
// //       const { data: child } = await supabase
// //         .from('children')
// //         .select('total_stars, current_streak, max_streak, last_activity_date')
// //         .eq('id', session.child_id)
// //         .single();

// //       // Update streak logic
// //       const now = new Date();
// //       const today = now.toISOString().split('T')[0];
// //       let newStreak = child.current_streak;

// //       if (child.last_activity_date) {
// //         const lastActivity = new Date(child.last_activity_date);
// //         const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);

// //         if (hoursSinceActivity > 24) {
// //           newStreak = 1;
// //         } else if (child.last_activity_date !== today) {
// //           const yesterday = new Date();
// //           yesterday.setDate(yesterday.getDate() - 1);
// //           const yesterdayStr = yesterday.toISOString().split('T')[0];

// //           if (child.last_activity_date === yesterdayStr) {
// //             newStreak += 1;
// //           } else {
// //             newStreak = 1;
// //           }
// //         }
// //       } else {
// //         newStreak = 1;
// //       }

// //       const newMaxStreak = Math.max(child.max_streak || 0, newStreak);

// //       await supabase
// //         .from('children')
// //         .update({
// //           total_stars: (child?.total_stars || 0) + starsEarned,
// //           current_streak: newStreak,
// //           max_streak: newMaxStreak,
// //           last_activity_date: now.toISOString()
// //         })
// //         .eq('id', session.child_id);
// //     }

// //     const { data: sfx } = await supabase
// //       .from('sfx')
// //       .select('id')
// //       .limit(1)
// //       .maybeSingle();

// //     const { data: animation } = await supabase
// //       .from('animations')
// //       .select('id')
// //       .limit(1)
// //       .maybeSingle();

// //     const { data: child } = await supabase
// //       .from('children')
// //       .select('level, total_stars, current_streak')
// //       .eq('id', session.child_id)
// //       .single();

// //     res.status(200).json({
// //       sessionId,
// //       finalScore,
// //       scoring: {
// //         baseScore,
// //         timePenalty,
// //         repeatAttemptPenalty
// //       },
// //       starsEarned,
// //       passed,
// //       celebration: {
// //         sfxId: sfx?.id || null,
// //         animationId: animation?.id || null
// //       },
// //       newProgress: {
// //         currentLevel: child?.level || 1,
// //         levelProgress: {
// //           completedInLevel: 0,
// //           totalInLevel: 10,
// //           percentage: 0
// //         },
// //         totalStars: child?.total_stars || 0,
// //         currentStreak: child?.current_streak || 0
// //       }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };

// // module.exports = {
// //   getChallengeCategories,
// //   startSession,
// //   getNextQuestion,
// //   submitAnswer,
// //   finishSession
// // };



// const supabase = require('../config/supabase');
// const { checkAndPromoteLevel } = require('../utils/levelManager');

// const getChallengeCategories = async (req, res) => {
//   try {
//     const { level, childId } = req.query;

//     if (!level || !childId) {
//       return res.status(400).json({ success: false, message: 'level and childId are required' });
//     }

//     const { data: categories, error } = await supabase
//       .from('challenge_categories')
//       .select('*, challenge_questions(id)')
//       .eq('level', parseInt(level))
//       .eq('is_published', true);

//     if (error) {
//       return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
//     }

//     const { data: child } = await supabase
//       .from('children')
//       .select('level')
//       .eq('id', childId)
//       .single();

//     // Check which categories have been completed
//     const { data: completedSessions } = await supabase
//       .from('attempt_sessions')
//       .select('category_id')
//       .eq('child_id', childId)
//       .eq('status', 'completed')
//       .eq('passed', true);

//     const completedCategoryIds = new Set((completedSessions || []).map(s => s.category_id));

//     const categoriesWithLock = (categories || []).map(cat => ({
//       id: cat.id,
//       name: cat.name,
//       level: cat.level,
//       isLocked: cat.level > (child?.level || 1),
//       isCompleted: completedCategoryIds.has(cat.id),
//       questionCount: cat.challenge_questions?.length || 0,
//       unlockRequirement: cat.level > (child?.level || 1)
//         ? `Complete all challenges in Level ${cat.level - 1} to unlock.`
//         : 'Complete all challenges in the previous level to unlock.'
//     }));

//     res.status(200).json({ categories: categoriesWithLock });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// const startSession = async (req, res) => {
//   try {
//     const { challengeCategoryId } = req.body;
//     const childId = req.user.id;

//     if (!challengeCategoryId) {
//       return res.status(400).json({ success: false, message: 'challengeCategoryId is required' });
//     }

//     const { data: category } = await supabase
//       .from('challenge_categories')
//       .select('level, is_published')
//       .eq('id', challengeCategoryId)
//       .single();

//     if (!category || !category.is_published) {
//       return res.status(403).json({ success: false, message: 'Challenge category is locked or not found' });
//     }

//     const { data: questions } = await supabase
//       .from('challenge_questions')
//       .select('id')
//       .eq('category_id', challengeCategoryId);

//     // Use standard supabase client
//     const { data: session, error } = await supabase
//       .from('attempt_sessions')
//       .insert({
//         child_id: childId,
//         category_id: challengeCategoryId,
//         status: 'active'
//       })
//       .select()
//       .single();

//     if (error) {
//       console.error('Start session error:', error);
//       return res.status(500).json({ success: false, message: 'Failed to start session', error: error.message });
//     }

//     res.status(201).json({
//       sessionId: session.id,
//       message: 'Session started.',
//       questionCount: questions?.length || 0
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// const getNextQuestion = async (req, res) => {
//   try {
//     const { sessionId } = req.params;

//     const { data: session } = await supabase
//       .from('attempt_sessions')
//       .select('category_id, status, child_id')
//       .eq('id', sessionId)
//       .single();

//     if (!session || session.status !== 'active') {
//       return res.status(404).json({ success: false, message: 'Session ended or all questions answered' });
//     }

//     const { data: answered } = await supabase
//       .from('attempt_answers')
//       .select('question_id, is_correct')
//       .eq('session_id', sessionId);

//     const correctlyAnsweredIds = (answered || []).filter(a => a.is_correct).map(a => a.question_id);

//     const { data: allQuestions } = await supabase
//       .from('challenge_questions')
//       .select('*')
//       .eq('category_id', session.category_id)
//       .order('order_index', { ascending: true });

//     const unansweredQuestions = (allQuestions || []).filter(q => !correctlyAnsweredIds.includes(q.id));

//     if (unansweredQuestions.length === 0) {
//        return finishSessionInternal(req, res, sessionId, session);
//     }

//     const question = unansweredQuestions[0];

//     // Check if a pending attempt already exists
//     const { data: existingAttempts } = await supabase
//         .from('attempt_answers')
//         .select('id, attempt_number')
//         .eq('session_id', sessionId)
//         .eq('question_id', question.id)
//         .order('attempt_number', { ascending: false })
//         .limit(1)
//         .maybeSingle();
        
//     // If this is the very first time engaging with this question
//     if (!existingAttempts) {
//         await supabase
//         .from('attempt_answers')
//         .insert({
//             session_id: sessionId,
//             question_id: question.id,
//             time_started: new Date().toISOString(),
//             is_correct: false,
//             answer: null,
//             score: 0,
//             time_taken_sec: 0,
//             attempt_number: 1
//         });
//     }

//     res.status(200).json({
//       questionId: question.id,
//       type: question.type,
//       question: question.question,
//       options: question.options,
//       timeLimitSec: question.time_limit_sec,
//       attemptNumber: existingAttempts ? existingAttempts.attempt_number : 1
//     });
//   } catch (error) {
//     console.error("Get Next Question Error", error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// // const submitAnswer = async (req, res) => {
// //   try {
// //     const { sessionId } = req.params;
// //     const { questionId, answer } = req.body;

// //     if (!questionId || answer === undefined) {
// //       return res.status(400).json({ success: false, message: 'questionId and answer are required' });
// //     }

// //     const { data: question } = await supabase
// //       .from('challenge_questions')
// //       .select('answer, time_limit_sec')
// //       .eq('id', questionId)
// //       .maybeSingle();

// //     if (!question) {
// //       return res.status(404).json({ success: false, message: 'Question not found' });
// //     }

// //     // Get the latest pending attempt record
// //     const { data: latestAttempt } = await supabase
// //       .from('attempt_answers')
// //       .select('*')
// //       .eq('session_id', sessionId)
// //       .eq('question_id', questionId)
// //       .eq('is_correct', false) 
// //       .order('attempt_number', { ascending: false })
// //       .limit(1)
// //       .maybeSingle();

// //     if (!latestAttempt) {
// //       return res.status(409).json({ success: false, message: 'No active attempt found or question already completed.' });
// //     }

// //     const attemptNumber = latestAttempt.attempt_number;
// //     const timeStarted = latestAttempt.time_started ? new Date(latestAttempt.time_started) : new Date();
// //     const now = new Date();
// //     const timeTakenSec = Math.round((now - timeStarted) / 1000);

// //     // Normalize answer comparison
// //     const isCorrect = JSON.stringify(question.answer) === JSON.stringify(answer);

// //     let score = isCorrect ? 10 : 0;
// //     let timePenalty = 0;
// //     let repeatPenalty = 0;

// //     // Time penalty
// //     if (question.time_limit_sec && timeTakenSec > question.time_limit_sec) {
// //       const extraTime = timeTakenSec - question.time_limit_sec;
// //       timePenalty = Math.min(5, Math.floor(extraTime / 10)); 
// //     }

// //     // Repeat attempt penalty
// //     if (attemptNumber > 1) {
// //       repeatPenalty = (attemptNumber - 1) * 2; 
// //     }

// //     score = Math.max(0, score - timePenalty - repeatPenalty);

// //     if (isCorrect) {
// //         await supabase
// //             .from('attempt_answers')
// //             .update({
// //                 answer: answer,
// //                 is_correct: true,
// //                 time_taken_sec: timeTakenSec,
// //                 score: score,
// //                 time_penalty: timePenalty,
// //                 repeat_penalty: repeatPenalty
// //             })
// //             .eq('id', latestAttempt.id);
// //     } else {
// //         // Failed attempt
// //         await supabase
// //             .from('attempt_answers')
// //             .update({
// //                 answer: answer,
// //                 is_correct: false,
// //                 time_taken_sec: timeTakenSec,
// //                 score: 0 
// //             })
// //             .eq('id', latestAttempt.id);

// //         // Create next attempt immediately
// //         await supabase
// //             .from('attempt_answers')
// //             .insert({
// //                 session_id: sessionId,
// //                 question_id: questionId,
// //                 time_started: new Date().toISOString(),
// //                 is_correct: false,
// //                 answer: null,
// //                 score: 0,
// //                 time_taken_sec: 0,
// //                 attempt_number: attemptNumber + 1
// //             });
// //     }

// //     res.status(200).json({
// //       correct: isCorrect,
// //       score: score,
// //       timeTakenSec: timeTakenSec,
// //       attemptNumber,
// //       penalties: {
// //         timePenalty,
// //         repeatPenalty
// //       },
// //       canRetry: !isCorrect
// //     });
// //   } catch (error) {
// //     console.error('Exception in submitAnswer:', error);
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };


// const submitAnswer = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const { questionId, answer } = req.body;

//     if (!questionId || answer === undefined) {
//       return res.status(400).json({ success: false, message: 'questionId and answer are required' });
//     }

//     const { data: question } = await supabase
//       .from('challenge_questions')
//       .select('answer, time_limit_sec')
//       .eq('id', questionId)
//       .maybeSingle();

//     if (!question) {
//       return res.status(404).json({ success: false, message: 'Question not found' });
//     }

//     // Get current attempt record
//     const { data: existingAttempts } = await supabase
//       .from('attempt_answers')
//       .select('*')
//       .eq('session_id', sessionId)
//       .eq('question_id', questionId)
//       .order('attempt_number', { ascending: false });

//     const latestAttempt = existingAttempts && existingAttempts.length > 0 ? existingAttempts[0] : null;

//     if (latestAttempt && latestAttempt.is_correct) {
//       return res.status(409).json({ success: false, message: 'Question already answered correctly' });
//     }

//     const attemptNumber = latestAttempt ? latestAttempt.attempt_number + 1 : 1;
//     const timeStarted = latestAttempt && latestAttempt.time_started
//       ? new Date(latestAttempt.time_started)
//       : new Date();

//     const now = new Date();
//     const timeTakenSec = Math.round((now - timeStarted) / 1000);

//     const isCorrect = JSON.stringify(question.answer) === JSON.stringify(answer);

//     let score = isCorrect ? 10 : 0;
//     let timePenalty = 0;
//     let repeatPenalty = 0;

//     // Calculate time penalty if exceeded time limit
//     if (question.time_limit_sec && timeTakenSec > question.time_limit_sec) {
//       const extraTime = timeTakenSec - question.time_limit_sec;
//       timePenalty = Math.min(5, Math.floor(extraTime / 10));
//     }

//     // Calculate repeat attempt penalty
//     if (attemptNumber > 1) {
//       repeatPenalty = (attemptNumber - 1) * 2;
//     }

//     score = Math.max(0, score - timePenalty - repeatPenalty);

//     // Delete previous attempts for this question if answer is wrong
//     if (!isCorrect && latestAttempt) {
//       await supabase
//         .from('attempt_answers')
//         .delete()
//         .eq('session_id', sessionId)
//         .eq('question_id', questionId);
//     }

//     // Insert new attempt
//     const { error } = await supabase
//       .from('attempt_answers')
//       .insert({
//         session_id: sessionId,
//         question_id: questionId,
//         answer: answer,
//         is_correct: isCorrect,
//         time_taken_sec: timeTakenSec,
//         score: score,
//         attempt_number: attemptNumber,
//         time_started: timeStarted.toISOString(),
//         time_penalty: timePenalty,
//         repeat_penalty: repeatPenalty
//       });

//     if (error) {
//       console.error('Submit answer error:', error);
//       return res.status(500).json({ success: false, message: 'Failed to submit answer', error: error.message });
//     }

//     res.status(200).json({
//       correct: isCorrect,
//       score: score,
//       timeTakenSec: timeTakenSec,
//       attemptNumber,
//       penalties: {
//         timePenalty,
//         repeatPenalty
//       },
//       canRetry: !isCorrect
//     });
//   } catch (error) {
//     console.error('Exception in submitAnswer:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// // Internal helper for finishing sessions
// const finishSessionInternal = async (req, res, sessionId, session) => {
//     // Removed authClient here too
//     const { data: answers } = await supabase
//       .from('attempt_answers')
//       .select('score, time_penalty, repeat_penalty')
//       .eq('session_id', sessionId)
//       .eq('is_correct', true); 

//     const { data: allQuestions } = await supabase
//         .from('challenge_questions')
//         .select('id')
//         .eq('category_id', session.category_id);

//     const finalScore = answers?.reduce((sum, a) => sum + (a.score || 0), 0) || 0;
//     const totalQuestions = allQuestions?.length || 1;
//     const correctAnswers = answers?.length || 0;
//     const percentage = Math.round((correctAnswers / totalQuestions) * 100);

//     const timePenaltyTotal = answers?.reduce((sum, a) => sum + (a.time_penalty || 0), 0) || 0;
//     const repeatAttemptPenaltyTotal = answers?.reduce((sum, a) => sum + (a.repeat_penalty || 0), 0) || 0;
    
//     const { data: category } = await supabase
//       .from('challenge_categories')
//       .select('pass_percentage, name')
//       .eq('id', session.category_id)
//       .single();

//     const passed = percentage >= (category?.pass_percentage || 70);
//     const starsEarned = passed ? Math.ceil(finalScore / 10) : 0; 

//     await supabase
//       .from('attempt_sessions')
//       .update({
//         status: 'completed',
//         final_score: finalScore,
//         stars_earned: starsEarned,
//         passed: passed,
//         completed_at: new Date().toISOString()
//       })
//       .eq('id', sessionId);

//     let newProgress = null;

//     if (passed) {
//       const { data: child } = await supabase
//         .from('children')
//         .select('total_stars, current_streak, max_streak, last_activity_date, display_name, level')
//         .eq('id', session.child_id)
//         .single();

//       // Streak Logic
//       const now = new Date();
//       const lastActivity = new Date(child.last_activity_date || 0);
      
//       const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//       const lastActivityDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
      
//       const diffTime = Math.abs(todayDate.getTime() - lastActivityDate.getTime());
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

//       let newStreak = child.current_streak || 0;

//       if (diffDays === 1) {
//           newStreak += 1;
//       } else if (diffDays > 1) {
//           newStreak = 1;
//       } else if (diffDays === 0) {
//           if (newStreak === 0) newStreak = 1;
//       } else {
//           newStreak = 1;
//       }

//       const newMaxStreak = Math.max(child.max_streak || 0, newStreak);

//       await supabase
//         .from('children')
//         .update({
//           total_stars: (child?.total_stars || 0) + starsEarned,
//           current_streak: newStreak,
//           max_streak: newMaxStreak,
//           last_activity_date: now.toISOString()
//         })
//         .eq('id', session.child_id);

//       // Notification
//       await supabase.from('child_notifications').insert({
//           child_id: session.child_id,
//           type: 'challenge_completed',
//           title: 'Challenge Mastered!',
//           message: `You completed the ${category.name} challenge and earned ${starsEarned} stars!`,
//           read: false
//       });

//       // Check Achievement
//       const { data: ach } = await supabase.from('achievements').select('id').eq('name', 'Challenge Seeker').maybeSingle();
//       if (ach) {
//          const { data: hasAch } = await supabase
//             .from('child_achievements')
//             .select('id')
//             .eq('child_id', session.child_id)
//             .eq('achievement_id', ach.id)
//             .maybeSingle();

//          if (!hasAch) {
//              await supabase.from('child_achievements').insert({
//                  child_id: session.child_id,
//                  achievement_id: ach.id
//              });
//              await supabase.from('child_notifications').insert({
//                 child_id: session.child_id,
//                 type: 'achievement_unlocked',
//                 title: 'Achievement Unlocked!',
//                 message: 'You earned the Challenge Seeker badge!',
//                 read: false
//              });
//          }
//       }

//       // Check Level Promotion
//       const promotionResult = await checkAndPromoteLevel(session.child_id);
//       let finalLevel = child.level;

//       if (promotionResult.promoted) {
//           finalLevel = promotionResult.newLevel;
//           await supabase.from('child_notifications').insert({
//              child_id: session.child_id,
//              type: 'level_up',
//              title: 'Level Up!',
//              message: `Congratulations! You have promoted to Level ${finalLevel}!`,
//              read: false
//           });
//       }

//       newProgress = {
//           totalStars: (child?.total_stars || 0) + starsEarned,
//           currentStreak: newStreak,
//           currentLevel: finalLevel,
//           levelUp: promotionResult.promoted
//       };
//     }

//     const { data: sfx } = await supabase.from('sfx').select('id').limit(1).maybeSingle();
//     const { data: animation } = await supabase.from('animations').select('id').limit(1).maybeSingle();

//     return res.status(200).json({
//       sessionId,
//       finalScore,
//       scoring: {
//         totalScore: finalScore,
//         timePenalty: timePenaltyTotal,
//         repeatAttemptPenalty: repeatAttemptPenaltyTotal
//       },
//       starsEarned,
//       passed,
//       celebration: {
//         sfxId: sfx?.id || null,
//         animationId: animation?.id || null
//       },
//       newProgress
//     });
// };

// const finishSession = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const { data: session } = await supabase
//       .from('attempt_sessions')
//       .select('child_id, category_id, status')
//       .eq('id', sessionId)
//       .single();

//     if (!session) {
//       return res.status(404).json({ success: false, message: 'Session not found' });
//     }
    
//     if (session.status !== 'active') {
//         return res.status(409).json({ success: false, message: 'Session already completed.' });
//     }

//     return finishSessionInternal(req, res, sessionId, session);
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// module.exports = {
//   getChallengeCategories,
//   startSession,
//   getNextQuestion,
//   submitAnswer,
//   finishSession
// };



// const supabase = require('../config/supabase');
// const { checkAndPromoteLevel } = require('../utils/levelManager');

// const getChallengeCategories = async (req, res) => {
//   try {
//     const { level, childId } = req.query;

//     if (!level || !childId) {
//       return res.status(400).json({ success: false, message: 'level and childId are required' });
//     }

//     const { data: categories, error } = await supabase
//       .from('challenge_categories')
//       .select('*, challenge_questions(id)')
//       .eq('level', parseInt(level))
//       .eq('is_published', true);

//     if (error) {
//       return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
//     }

//     const { data: child } = await supabase
//       .from('children')
//       .select('level')
//       .eq('id', childId)
//       .single();

//     // Check which categories have been completed
//     const { data: completedSessions } = await supabase
//       .from('attempt_sessions')
//       .select('category_id')
//       .eq('child_id', childId)
//       .eq('status', 'completed')
//       .eq('passed', true);

//     const completedCategoryIds = new Set((completedSessions || []).map(s => s.category_id));

//     const categoriesWithLock = (categories || []).map(cat => ({
//       id: cat.id,
//       name: cat.name,
//       level: cat.level,
//       isLocked: cat.level > (child?.level || 1),
//       isCompleted: completedCategoryIds.has(cat.id),
//       questionCount: cat.challenge_questions?.length || 0,
//       unlockRequirement: cat.level > (child?.level || 1)
//         ? `Complete all challenges in Level ${cat.level - 1} to unlock.`
//         : 'Complete all challenges in the previous level to unlock.'
//     }));

//     res.status(200).json({ categories: categoriesWithLock });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// const startSession = async (req, res) => {
//   try {
//     const { challengeCategoryId } = req.body;
//     const childId = req.user.id;

//     if (!challengeCategoryId) {
//       return res.status(400).json({ success: false, message: 'challengeCategoryId is required' });
//     }

//     const { data: category } = await supabase
//       .from('challenge_categories')
//       .select('level, is_published')
//       .eq('id', challengeCategoryId)
//       .single();

//     if (!category || !category.is_published) {
//       return res.status(403).json({ success: false, message: 'Challenge category is locked or not found' });
//     }

//     const { data: questions } = await supabase
//       .from('challenge_questions')
//       .select('id')
//       .eq('category_id', challengeCategoryId);

//     // Use standard supabase client
//     const { data: session, error } = await supabase
//       .from('attempt_sessions')
//       .insert({
//         child_id: childId,
//         category_id: challengeCategoryId,
//         status: 'active'
//       })
//       .select()
//       .single();

//     if (error) {
//       console.error('Start session error:', error);
//       return res.status(500).json({ success: false, message: 'Failed to start session', error: error.message });
//     }

//     res.status(201).json({
//       sessionId: session.id,
//       message: 'Session started.',
//       questionCount: questions?.length || 0
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// const getNextQuestion = async (req, res) => {
//   try {
//     const { sessionId } = req.params;

//     const { data: session } = await supabase
//       .from('attempt_sessions')
//       .select('category_id, status, child_id')
//       .eq('id', sessionId)
//       .single();

//     if (!session || session.status !== 'active') {
//       return res.status(404).json({ success: false, message: 'Session ended or all questions answered' });
//     }

//     const { data: answered } = await supabase
//       .from('attempt_answers')
//       .select('question_id, is_correct')
//       .eq('session_id', sessionId);

//     const correctlyAnsweredIds = (answered || []).filter(a => a.is_correct).map(a => a.question_id);

//     const { data: allQuestions } = await supabase
//       .from('challenge_questions')
//       .select('*')
//       .eq('category_id', session.category_id)
//       .order('order_index', { ascending: true });

//     const unansweredQuestions = (allQuestions || []).filter(q => !correctlyAnsweredIds.includes(q.id));

//     if (unansweredQuestions.length === 0) {
//        return finishSessionInternal(req, res, sessionId, session);
//     }

//     const question = unansweredQuestions[0];

//     // Check if a pending attempt already exists
//     const { data: existingAttempts } = await supabase
//         .from('attempt_answers')
//         .select('id, attempt_number')
//         .eq('session_id', sessionId)
//         .eq('question_id', question.id)
//         .order('attempt_number', { ascending: false })
//         .limit(1)
//         .maybeSingle();
        
//     // If this is the very first time engaging with this question
//     if (!existingAttempts) {
//         await supabase
//         .from('attempt_answers')
//         .insert({
//             session_id: sessionId,
//             question_id: question.id,
//             time_started: new Date().toISOString(),
//             is_correct: false,
//             answer: null,
//             score: 0,
//             time_taken_sec: 0,
//             attempt_number: 1
//         });
//     }

//     res.status(200).json({
//       questionId: question.id,
//       type: question.type,
//       question: question.question,
//       options: question.options,
//       timeLimitSec: question.time_limit_sec,
//       attemptNumber: existingAttempts ? existingAttempts.attempt_number : 1
//     });
//   } catch (error) {
//     console.error("Get Next Question Error", error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// // const submitAnswer = async (req, res) => {
// //   try {
// //     const { sessionId } = req.params;
// //     const { questionId, answer } = req.body;

// //     if (!questionId || answer === undefined) {
// //       return res.status(400).json({ success: false, message: 'questionId and answer are required' });
// //     }

// //     const { data: question } = await supabase
// //       .from('challenge_questions')
// //       .select('answer, time_limit_sec')
// //       .eq('id', questionId)
// //       .maybeSingle();

// //     if (!question) {
// //       return res.status(404).json({ success: false, message: 'Question not found' });
// //     }

// //     // Get current attempt record
// //     const { data: existingAttempts } = await supabase
// //       .from('attempt_answers')
// //       .select('*')
// //       .eq('session_id', sessionId)
// //       .eq('question_id', questionId)
// //       .order('attempt_number', { ascending: false });

// //     const latestAttempt = existingAttempts && existingAttempts.length > 0 ? existingAttempts[0] : null;

// //     if (latestAttempt && latestAttempt.is_correct) {
// //       return res.status(409).json({ success: false, message: 'Question already answered correctly' });
// //     }

// //     const attemptNumber = latestAttempt ? latestAttempt.attempt_number + 1 : 1;
// //     const timeStarted = latestAttempt && latestAttempt.time_started
// //       ? new Date(latestAttempt.time_started)
// //       : new Date();

// //     const now = new Date();
// //     const timeTakenSec = Math.round((now - timeStarted) / 1000);

// //     const isCorrect = JSON.stringify(question.answer) === JSON.stringify(answer);

// //     let score = isCorrect ? 10 : 0;
// //     let timePenalty = 0;
// //     let repeatPenalty = 0;

// //     // Calculate time penalty if exceeded time limit
// //     if (question.time_limit_sec && timeTakenSec > question.time_limit_sec) {
// //       const extraTime = timeTakenSec - question.time_limit_sec;
// //       timePenalty = Math.min(5, Math.floor(extraTime / 10));
// //     }

// //     // Calculate repeat attempt penalty
// //     if (attemptNumber > 1) {
// //       repeatPenalty = (attemptNumber - 1) * 2;
// //     }

// //     score = Math.max(0, score - timePenalty - repeatPenalty);

// //     // Delete previous attempts for this question if answer is wrong
// //     if (!isCorrect && latestAttempt) {
// //       await supabase
// //         .from('attempt_answers')
// //         .delete()
// //         .eq('session_id', sessionId)
// //         .eq('question_id', questionId);
// //     }

// //     // Insert new attempt
// //     const { error } = await supabase
// //       .from('attempt_answers')
// //       .insert({
// //         session_id: sessionId,
// //         question_id: questionId,
// //         answer: answer,
// //         is_correct: isCorrect,
// //         time_taken_sec: timeTakenSec,
// //         score: score,
// //         attempt_number: attemptNumber,
// //         time_started: timeStarted.toISOString(),
// //         time_penalty: timePenalty,
// //         repeat_penalty: repeatPenalty
// //       });

// //     if (error) {
// //       console.error('Submit answer error:', error);
// //       return res.status(500).json({ success: false, message: 'Failed to submit answer', error: error.message });
// //     }

// //     res.status(200).json({
// //       correct: isCorrect,
// //       score: score,
// //       timeTakenSec: timeTakenSec,
// //       attemptNumber,
// //       penalties: {
// //         timePenalty,
// //         repeatPenalty
// //       },
// //       canRetry: !isCorrect
// //     });
// //   } catch (error) {
// //     console.error('Exception in submitAnswer:', error);
// //     res.status(500).json({ success: false, message: 'Internal server error' });
// //   }
// // };



// const submitAnswer = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     let { questionId, answer } = req.body;

//     if (!questionId || answer === undefined) {
//       return res.status(400).json({ success: false, message: 'questionId and answer are required' });
//     }

//     const { data: question } = await supabase
//       .from('challenge_questions')
//       .select('answer, time_limit_sec')
//       .eq('id', questionId)
//       .maybeSingle();

//     if (!question) {
//       return res.status(404).json({ success: false, message: 'Question not found' });
//     }

//     // --- DEBUG LOG START ---
//     console.log("--- SUBMIT ANSWER DEBUG ---");
//     console.log("1. Received Answer Type:", typeof answer);
//     console.log("2. Received Answer Value:", JSON.stringify(answer));
//     console.log("3. DB Expected Answer Type:", typeof question.answer);
//     console.log("4. DB Expected Answer Value:", JSON.stringify(question.answer));
//     // -----------------------

//     // FLUTTERFLOW COMPATIBILITY LAYER
//     if (typeof answer === 'string' && typeof question.answer === 'object' && question.answer !== null) {
//       try {
//         const parsed = JSON.parse(answer);
//         answer = parsed;
//         console.log("5. Parsed FlutterFlow String to JSON:", JSON.stringify(answer));
//       } catch (e) {
//         console.log("x. Parsing Failed:", e.message);
//       }
//     }

//     // Get current attempt record
//     const { data: existingAttempts } = await supabase
//       .from('attempt_answers')
//       .select('*')
//       .eq('session_id', sessionId)
//       .eq('question_id', questionId)
//       .order('attempt_number', { ascending: false });

//     const latestAttempt = existingAttempts && existingAttempts.length > 0 ? existingAttempts[0] : null;

//     if (latestAttempt && latestAttempt.is_correct) {
//       return res.status(409).json({ success: false, message: 'Question already answered correctly' });
//     }

//     const attemptNumber = latestAttempt ? latestAttempt.attempt_number + 1 : 1;
//     const timeStarted = latestAttempt && latestAttempt.time_started
//       ? new Date(latestAttempt.time_started)
//       : new Date();

//     const now = new Date();
//     const timeTakenSec = Math.round((now - timeStarted) / 1000);

//     // --- ROBUST COMPARISON ---
//     // Instead of simple JSON.stringify, we normalize slightly
//     const dbString = JSON.stringify(question.answer);
//     const inputString = JSON.stringify(answer);
    
//     // Log the exact comparison
//     console.log(`6. Comparing:\n   DB:    ${dbString}\n   INPUT: ${inputString}`);
    
//     const isCorrect = dbString === inputString;
//     console.log("7. Result:", isCorrect);
//     console.log("-------------------------");

//     let score = isCorrect ? 10 : 0;
//     let timePenalty = 0;
//     let repeatPenalty = 0;

//     if (question.time_limit_sec && timeTakenSec > question.time_limit_sec) {
//       const extraTime = timeTakenSec - question.time_limit_sec;
//       timePenalty = Math.min(5, Math.floor(extraTime / 10));
//     }

//     if (attemptNumber > 1) {
//       repeatPenalty = (attemptNumber - 1) * 2;
//     }

//     score = Math.max(0, score - timePenalty - repeatPenalty);

//     if (!isCorrect && latestAttempt) {
//       await supabase
//         .from('attempt_answers')
//         .delete()
//         .eq('session_id', sessionId)
//         .eq('question_id', questionId);
//     }

//     const { error } = await supabase
//       .from('attempt_answers')
//       .insert({
//         session_id: sessionId,
//         question_id: questionId,
//         answer: answer,
//         is_correct: isCorrect,
//         time_taken_sec: timeTakenSec,
//         score: score,
//         attempt_number: attemptNumber,
//         time_started: timeStarted.toISOString(),
//         time_penalty: timePenalty,
//         repeat_penalty: repeatPenalty
//       });

//     if (error) {
//       console.error('Submit answer error:', error);
//       return res.status(500).json({ success: false, message: 'Failed to submit answer', error: error.message });
//     }

//     res.status(200).json({
//       correct: isCorrect,
//       score: score,
//       timeTakenSec: timeTakenSec,
//       attemptNumber,
//       penalties: {
//         timePenalty,
//         repeatPenalty
//       },
//       canRetry: !isCorrect
//     });
//   } catch (error) {
//     console.error('Exception in submitAnswer:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// // Internal helper for finishing sessions
// const finishSessionInternal = async (req, res, sessionId, session) => {
//     // Removed authClient here too
//     const { data: answers } = await supabase
//       .from('attempt_answers')
//       .select('score, time_penalty, repeat_penalty')
//       .eq('session_id', sessionId)
//       .eq('is_correct', true); 

//     const { data: allQuestions } = await supabase
//         .from('challenge_questions')
//         .select('id')
//         .eq('category_id', session.category_id);

//     const finalScore = answers?.reduce((sum, a) => sum + (a.score || 0), 0) || 0;
//     const totalQuestions = allQuestions?.length || 1;
//     const correctAnswers = answers?.length || 0;
//     const percentage = Math.round((correctAnswers / totalQuestions) * 100);

//     const timePenaltyTotal = answers?.reduce((sum, a) => sum + (a.time_penalty || 0), 0) || 0;
//     const repeatAttemptPenaltyTotal = answers?.reduce((sum, a) => sum + (a.repeat_penalty || 0), 0) || 0;
    
//     const { data: category } = await supabase
//       .from('challenge_categories')
//       .select('pass_percentage, name')
//       .eq('id', session.category_id)
//       .single();

//     const passed = percentage >= (category?.pass_percentage || 70);
//     const starsEarned = passed ? Math.ceil(finalScore / 10) : 0; 

//     await supabase
//       .from('attempt_sessions')
//       .update({
//         status: 'completed',
//         final_score: finalScore,
//         stars_earned: starsEarned,
//         passed: passed,
//         completed_at: new Date().toISOString()
//       })
//       .eq('id', sessionId);

//     let newProgress = null;

//     if (passed) {
//       const { data: child } = await supabase
//         .from('children')
//         .select('total_stars, current_streak, max_streak, last_activity_date, display_name, level')
//         .eq('id', session.child_id)
//         .single();

//       // Streak Logic
//       const now = new Date();
//       const lastActivity = new Date(child.last_activity_date || 0);
      
//       const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//       const lastActivityDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
      
//       const diffTime = Math.abs(todayDate.getTime() - lastActivityDate.getTime());
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

//       let newStreak = child.current_streak || 0;

//       if (diffDays === 1) {
//           newStreak += 1;
//       } else if (diffDays > 1) {
//           newStreak = 1;
//       } else if (diffDays === 0) {
//           if (newStreak === 0) newStreak = 1;
//       } else {
//           newStreak = 1;
//       }

//       const newMaxStreak = Math.max(child.max_streak || 0, newStreak);

//       await supabase
//         .from('children')
//         .update({
//           total_stars: (child?.total_stars || 0) + starsEarned,
//           current_streak: newStreak,
//           max_streak: newMaxStreak,
//           last_activity_date: now.toISOString()
//         })
//         .eq('id', session.child_id);

//       // Notification
//       await supabase.from('child_notifications').insert({
//           child_id: session.child_id,
//           type: 'challenge_completed',
//           title: 'Challenge Mastered!',
//           message: `You completed the ${category.name} challenge and earned ${starsEarned} stars!`,
//           read: false
//       });

//       // Check Achievement
//       const { data: ach } = await supabase.from('achievements').select('id').eq('name', 'Challenge Seeker').maybeSingle();
//       if (ach) {
//          const { data: hasAch } = await supabase
//             .from('child_achievements')
//             .select('id')
//             .eq('child_id', session.child_id)
//             .eq('achievement_id', ach.id)
//             .maybeSingle();

//          if (!hasAch) {
//              await supabase.from('child_achievements').insert({
//                  child_id: session.child_id,
//                  achievement_id: ach.id
//              });
//              await supabase.from('child_notifications').insert({
//                 child_id: session.child_id,
//                 type: 'achievement_unlocked',
//                 title: 'Achievement Unlocked!',
//                 message: 'You earned the Challenge Seeker badge!',
//                 read: false
//              });
//          }
//       }

//       // Check Level Promotion
//       const promotionResult = await checkAndPromoteLevel(session.child_id);
//       let finalLevel = child.level;

//       if (promotionResult.promoted) {
//           finalLevel = promotionResult.newLevel;
//           await supabase.from('child_notifications').insert({
//              child_id: session.child_id,
//              type: 'level_up',
//              title: 'Level Up!',
//              message: `Congratulations! You have promoted to Level ${finalLevel}!`,
//              read: false
//           });
//       }

//       newProgress = {
//           totalStars: (child?.total_stars || 0) + starsEarned,
//           currentStreak: newStreak,
//           currentLevel: finalLevel,
//           levelUp: promotionResult.promoted
//       };
//     }

//     const { data: sfx } = await supabase.from('sfx').select('id').limit(1).maybeSingle();
//     const { data: animation } = await supabase.from('animations').select('id').limit(1).maybeSingle();

//     return res.status(200).json({
//       sessionId,
//       finalScore,
//       scoring: {
//         totalScore: finalScore,
//         timePenalty: timePenaltyTotal,
//         repeatAttemptPenalty: repeatAttemptPenaltyTotal
//       },
//       starsEarned,
//       passed,
//       celebration: {
//         sfxId: sfx?.id || null,
//         animationId: animation?.id || null
//       },
//       newProgress
//     });
// };

// const finishSession = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const { data: session } = await supabase
//       .from('attempt_sessions')
//       .select('child_id, category_id, status')
//       .eq('id', sessionId)
//       .single();

//     if (!session) {
//       return res.status(404).json({ success: false, message: 'Session not found' });
//     }
    
//     if (session.status !== 'active') {
//         return res.status(409).json({ success: false, message: 'Session already completed.' });
//     }

//     return finishSessionInternal(req, res, sessionId, session);
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// module.exports = {
//   getChallengeCategories,
//   startSession,
//   getNextQuestion,
//   submitAnswer,
//   finishSession
// };



const supabase = require('../config/supabase');
const { checkAndPromoteLevel } = require('../utils/levelManager');

const getChallengeCategories = async (req, res) => {
  try {
    const { level, childId } = req.query;

    if (!level || !childId) {
      return res.status(400).json({ success: false, message: 'level and childId are required' });
    }

    const { data: categories, error } = await supabase
      .from('challenge_categories')
      .select('*, challenge_questions(id)')
      .eq('level', parseInt(level))
      .eq('is_published', true);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }

    const { data: child } = await supabase
      .from('children')
      .select('level')
      .eq('id', childId)
      .single();

    // Check which categories have been completed
    const { data: completedSessions } = await supabase
      .from('attempt_sessions')
      .select('category_id')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .eq('passed', true);

    const completedCategoryIds = new Set((completedSessions || []).map(s => s.category_id));

    const categoriesWithLock = (categories || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      level: cat.level,
      isLocked: cat.level > (child?.level || 1),
      isCompleted: completedCategoryIds.has(cat.id),
      questionCount: cat.challenge_questions?.length || 0,
      unlockRequirement: cat.level > (child?.level || 1)
        ? `Complete all challenges in Level ${cat.level - 1} to unlock.`
        : 'Complete all challenges in the previous level to unlock.'
    }));

    res.status(200).json({ categories: categoriesWithLock });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const startSession = async (req, res) => {
  try {
    const { challengeCategoryId } = req.body;
    const childId = req.user.id;

    if (!challengeCategoryId) {
      return res.status(400).json({ success: false, message: 'challengeCategoryId is required' });
    }

    const { data: category } = await supabase
      .from('challenge_categories')
      .select('level, is_published')
      .eq('id', challengeCategoryId)
      .single();

    if (!category || !category.is_published) {
      return res.status(403).json({ success: false, message: 'Challenge category is locked or not found' });
    }

    const { data: questions } = await supabase
      .from('challenge_questions')
      .select('id')
      .eq('category_id', challengeCategoryId);

    // Use standard supabase client
    const { data: session, error } = await supabase
      .from('attempt_sessions')
      .insert({
        child_id: childId,
        category_id: challengeCategoryId,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Start session error:', error);
      return res.status(500).json({ success: false, message: 'Failed to start session', error: error.message });
    }

    res.status(201).json({
      sessionId: session.id,
      message: 'Session started.',
      questionCount: questions?.length || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getNextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data: session } = await supabase
      .from('attempt_sessions')
      .select('category_id, status, child_id')
      .eq('id', sessionId)
      .single();

    if (!session || session.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Session ended or all questions answered' });
    }

    const { data: answered } = await supabase
      .from('attempt_answers')
      .select('question_id, is_correct')
      .eq('session_id', sessionId);

    const correctlyAnsweredIds = (answered || []).filter(a => a.is_correct).map(a => a.question_id);

    const { data: allQuestions } = await supabase
      .from('challenge_questions')
      .select('*')
      .eq('category_id', session.category_id)
      .order('order_index', { ascending: true });

    const unansweredQuestions = (allQuestions || []).filter(q => !correctlyAnsweredIds.includes(q.id));

    // MODIFICATION 1: Return indicator instead of auto-finishing
    if (unansweredQuestions.length === 0) {
       return res.status(200).json({ 
         success: true, 
         questionsFinished: true,
         message: 'All questions have been answered. Please call finish session.'
       });
    }

    const question = unansweredQuestions[0];
    
    // MODIFICATION 2: Check if this is the last question
    const isLastQuestion = unansweredQuestions.length === 1;

    // Check if a pending attempt already exists
    const { data: existingAttempts } = await supabase
        .from('attempt_answers')
        .select('id, attempt_number')
        .eq('session_id', sessionId)
        .eq('question_id', question.id)
        .order('attempt_number', { ascending: false })
        .limit(1)
        .maybeSingle();
        
    // If this is the very first time engaging with this question
    if (!existingAttempts) {
        await supabase
        .from('attempt_answers')
        .insert({
            session_id: sessionId,
            question_id: question.id,
            time_started: new Date().toISOString(),
            is_correct: false,
            answer: null,
            score: 0,
            time_taken_sec: 0,
            attempt_number: 1
        });
    }

    // MODIFICATION 3: Calculate answer length
    let answerLength = 0;
    if (question.answer) {
      if (Array.isArray(question.answer)) {
        answerLength = question.answer.length;
      } else if (typeof question.answer === 'string') {
        answerLength = question.answer.length;
      }
    }

    res.status(200).json({
      questionId: question.id,
      type: question.type,
      question: question.question,
      options: question.options,
      timeLimitSec: question.time_limit_sec,
      attemptNumber: existingAttempts ? existingAttempts.attempt_number : 1,
      // New fields added to response
      answerLength: answerLength,
      isLastQuestion: isLastQuestion
    });
  } catch (error) {
    console.error("Get Next Question Error", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    let { questionId, answer } = req.body;

    if (!questionId || answer === undefined) {
      return res.status(400).json({ success: false, message: 'questionId and answer are required' });
    }

    const { data: question } = await supabase
      .from('challenge_questions')
      .select('answer, time_limit_sec')
      .eq('id', questionId)
      .maybeSingle();

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // --- DEBUG LOG START ---
    console.log("--- SUBMIT ANSWER DEBUG ---");
    console.log("1. Received Answer Type:", typeof answer);
    console.log("2. Received Answer Value:", JSON.stringify(answer));
    console.log("3. DB Expected Answer Type:", typeof question.answer);
    console.log("4. DB Expected Answer Value:", JSON.stringify(question.answer));
    // -----------------------

    // FLUTTERFLOW COMPATIBILITY LAYER
    if (typeof answer === 'string' && typeof question.answer === 'object' && question.answer !== null) {
      try {
        const parsed = JSON.parse(answer);
        answer = parsed;
        console.log("5. Parsed FlutterFlow String to JSON:", JSON.stringify(answer));
      } catch (e) {
        console.log("x. Parsing Failed:", e.message);
      }
    }

    // Get current attempt record
    const { data: existingAttempts } = await supabase
      .from('attempt_answers')
      .select('*')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .order('attempt_number', { ascending: false });

    const latestAttempt = existingAttempts && existingAttempts.length > 0 ? existingAttempts[0] : null;

    if (latestAttempt && latestAttempt.is_correct) {
      return res.status(409).json({ success: false, message: 'Question already answered correctly' });
    }

    const attemptNumber = latestAttempt ? latestAttempt.attempt_number + 1 : 1;
    const timeStarted = latestAttempt && latestAttempt.time_started
      ? new Date(latestAttempt.time_started)
      : new Date();

    const now = new Date();
    const timeTakenSec = Math.round((now - timeStarted) / 1000);

    // --- ROBUST COMPARISON ---
    // Instead of simple JSON.stringify, we normalize slightly
    const dbString = JSON.stringify(question.answer);
    const inputString = JSON.stringify(answer);
    
    // Log the exact comparison
    console.log(`6. Comparing:\n   DB:    ${dbString}\n   INPUT: ${inputString}`);
    
    const isCorrect = dbString === inputString;
    console.log("7. Result:", isCorrect);
    console.log("-------------------------");

    let score = isCorrect ? 10 : 0;
    let timePenalty = 0;
    let repeatPenalty = 0;

    if (question.time_limit_sec && timeTakenSec > question.time_limit_sec) {
      const extraTime = timeTakenSec - question.time_limit_sec;
      timePenalty = Math.min(5, Math.floor(extraTime / 10));
    }

    if (attemptNumber > 1) {
      repeatPenalty = (attemptNumber - 1) * 2;
    }

    score = Math.max(0, score - timePenalty - repeatPenalty);

    if (!isCorrect && latestAttempt) {
      await supabase
        .from('attempt_answers')
        .delete()
        .eq('session_id', sessionId)
        .eq('question_id', questionId);
    }

    const { error } = await supabase
      .from('attempt_answers')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        answer: answer,
        is_correct: isCorrect,
        time_taken_sec: timeTakenSec,
        score: score,
        attempt_number: attemptNumber,
        time_started: timeStarted.toISOString(),
        time_penalty: timePenalty,
        repeat_penalty: repeatPenalty
      });

    if (error) {
      console.error('Submit answer error:', error);
      return res.status(500).json({ success: false, message: 'Failed to submit answer', error: error.message });
    }

    res.status(200).json({
      correct: isCorrect,
      score: score,
      timeTakenSec: timeTakenSec,
      attemptNumber,
      penalties: {
        timePenalty,
        repeatPenalty
      },
      canRetry: !isCorrect
    });
  } catch (error) {
    console.error('Exception in submitAnswer:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Internal helper for finishing sessions
const finishSessionInternal = async (req, res, sessionId, session) => {
    // Removed authClient here too
    const { data: answers } = await supabase
      .from('attempt_answers')
      .select('score, time_penalty, repeat_penalty')
      .eq('session_id', sessionId)
      .eq('is_correct', true); 

    const { data: allQuestions } = await supabase
        .from('challenge_questions')
        .select('id')
        .eq('category_id', session.category_id);

    const finalScore = answers?.reduce((sum, a) => sum + (a.score || 0), 0) || 0;
    const totalQuestions = allQuestions?.length || 1;
    const correctAnswers = answers?.length || 0;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const timePenaltyTotal = answers?.reduce((sum, a) => sum + (a.time_penalty || 0), 0) || 0;
    const repeatAttemptPenaltyTotal = answers?.reduce((sum, a) => sum + (a.repeat_penalty || 0), 0) || 0;
    
    const { data: category } = await supabase
      .from('challenge_categories')
      .select('pass_percentage, name')
      .eq('id', session.category_id)
      .single();

    const passed = percentage >= (category?.pass_percentage || 70);
    const starsEarned = passed ? Math.ceil(finalScore / 10) : 0; 

    await supabase
      .from('attempt_sessions')
      .update({
        status: 'completed',
        final_score: finalScore,
        stars_earned: starsEarned,
        passed: passed,
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    let newProgress = null;

    if (passed) {
      const { data: child } = await supabase
        .from('children')
        .select('total_stars, current_streak, max_streak, last_activity_date, display_name, level')
        .eq('id', session.child_id)
        .single();

      // Streak Logic
      const now = new Date();
      const lastActivity = new Date(child.last_activity_date || 0);
      
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastActivityDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
      
      const diffTime = Math.abs(todayDate.getTime() - lastActivityDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      let newStreak = child.current_streak || 0;

      if (diffDays === 1) {
          newStreak += 1;
      } else if (diffDays > 1) {
          newStreak = 1;
      } else if (diffDays === 0) {
          if (newStreak === 0) newStreak = 1;
      } else {
          newStreak = 1;
      }

      const newMaxStreak = Math.max(child.max_streak || 0, newStreak);

      await supabase
        .from('children')
        .update({
          total_stars: (child?.total_stars || 0) + starsEarned,
          current_streak: newStreak,
          max_streak: newMaxStreak,
          last_activity_date: now.toISOString()
        })
        .eq('id', session.child_id);

      // Notification
      await supabase.from('child_notifications').insert({
          child_id: session.child_id,
          type: 'challenge_completed',
          title: 'Challenge Mastered!',
          message: `You completed the ${category.name} challenge and earned ${starsEarned} stars!`,
          read: false
      });

      // Check Achievement
      const { data: ach } = await supabase.from('achievements').select('id').eq('name', 'Challenge Seeker').maybeSingle();
      if (ach) {
         const { data: hasAch } = await supabase
            .from('child_achievements')
            .select('id')
            .eq('child_id', session.child_id)
            .eq('achievement_id', ach.id)
            .maybeSingle();

         if (!hasAch) {
             await supabase.from('child_achievements').insert({
                 child_id: session.child_id,
                 achievement_id: ach.id
             });
             await supabase.from('child_notifications').insert({
                child_id: session.child_id,
                type: 'achievement_unlocked',
                title: 'Achievement Unlocked!',
                message: 'You earned the Challenge Seeker badge!',
                read: false
             });
         }
      }

      // Check Level Promotion
      const promotionResult = await checkAndPromoteLevel(session.child_id);
      let finalLevel = child.level;

      if (promotionResult.promoted) {
          finalLevel = promotionResult.newLevel;
          await supabase.from('child_notifications').insert({
             child_id: session.child_id,
             type: 'level_up',
             title: 'Level Up!',
             message: `Congratulations! You have promoted to Level ${finalLevel}!`,
             read: false
          });
      }

      newProgress = {
          totalStars: (child?.total_stars || 0) + starsEarned,
          currentStreak: newStreak,
          currentLevel: finalLevel,
          levelUp: promotionResult.promoted
      };
    }

    const { data: sfx } = await supabase.from('sfx').select('id').limit(1).maybeSingle();
    const { data: animation } = await supabase.from('animations').select('id').limit(1).maybeSingle();

    return res.status(200).json({
      sessionId,
      finalScore,
      scoring: {
        totalScore: finalScore,
        timePenalty: timePenaltyTotal,
        repeatAttemptPenalty: repeatAttemptPenaltyTotal
      },
      starsEarned,
      passed,
      celebration: {
        sfxId: sfx?.id || null,
        animationId: animation?.id || null
      },
      newProgress
    });
};

const finishSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { data: session } = await supabase
      .from('attempt_sessions')
      .select('child_id, category_id, status')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (session.status !== 'active') {
        return res.status(409).json({ success: false, message: 'Session already completed.' });
    }

    return finishSessionInternal(req, res, sessionId, session);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getChallengeCategories,
  startSession,
  getNextQuestion,
  submitAnswer,
  finishSession
};