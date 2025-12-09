const supabase = require('../config/supabase');

const getLeaderboard = async (req, res) => {
  try {
    const { period } = req.query;
    const childId = req.user.id;

    if (!period || !['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ success: false, message: 'Valid period (daily, weekly, monthly) is required' });
    }

    const { data: currentChild } = await supabase
      .from('children')
      .select('level')
      .eq('id', childId)
      .maybeSingle();

    const childLevel = currentChild?.level || 1;

    const now = new Date();
    let startDate;

    if (period === 'daily') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    const { data: lessonCompletions, error: lessonError } = await supabase
      .from('lesson_completions')
      .select('child_id, stars_earned')
      .gte('completed_at', startDate.toISOString());

    const { data: challengeSessions, error: challengeError } = await supabase
      .from('attempt_sessions')
      .select('child_id, stars_earned')
      .eq('status', 'completed')
      .eq('passed', true)
      .gte('completed_at', startDate.toISOString());

    if (lessonError || challengeError) {
      console.error('Leaderboard fetch error:', lessonError || challengeError);
      return res.status(500).json({ success: false, message: 'Failed to fetch leaderboard data' });
    }

    const childStars = {};

    (lessonCompletions || []).forEach(completion => {
      if (!childStars[completion.child_id]) {
        childStars[completion.child_id] = 0;
      }
      childStars[completion.child_id] += completion.stars_earned || 0;
    });

    (challengeSessions || []).forEach(session => {
      if (!childStars[session.child_id]) {
        childStars[session.child_id] = 0;
      }
      childStars[session.child_id] += session.stars_earned || 0;
    });

    const { data: children, error } = await supabase
      .from('children')
      .select('id, display_name, current_streak, max_streak, avatar_url, level')
      .eq('level', childLevel);

    if (error) {
      console.error('Children fetch error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch children data' });
    }

    const entries = (children || [])
      .map(child => ({
        childId: child.id,
        childName: child.display_name,
        stars: childStars[child.id] || 0,
        streak: child.current_streak,
        maxStreak: child.max_streak,
        avatar: child.avatar_url
      }))
      .sort((a, b) => b.stars - a.stars)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry
      }))
      .slice(0, 100);

    const userEntry = entries.find(e => e.childId === childId);
    const userRank = userEntry ? userEntry.rank : entries.length + 1;

    res.status(200).json({
      period,
      level: childLevel,
      totalInLevel: entries.length,
      entries,
      userRank
    });
  } catch (error) {
    console.error('Exception in getLeaderboard:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getProgressSummary = async (req, res) => {
  try {
    const childId = req.user.id;

    const { data: child, error: childError } = await supabase
      .from('children')
      .select('level, total_stars, current_streak, max_streak')
      .eq('id', childId)
      .maybeSingle();

    if (childError || !child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    const { data: lessonCategories } = await supabase
      .from('lesson_categories')
      .select('id, name, level')
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    const lessonCategoryProgress = [];
    let totalLessonsCompleted = 0;
    let totalLessonsAvailable = 0;

    for (const category of lessonCategories || []) {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('category_id', category.id);

      const totalInCategory = lessons?.length || 0;

      const { data: completions } = await supabase
        .from('lesson_completions')
        .select('lesson_id')
        .eq('child_id', childId)
        .in('lesson_id', (lessons || []).map(l => l.id));

      const completedInCategory = completions?.length || 0;

      totalLessonsCompleted += completedInCategory;
      totalLessonsAvailable += totalInCategory;

      if (totalInCategory > 0) {
        lessonCategoryProgress.push({
          categoryName: category.name,
          level: category.level,
          completed: completedInCategory,
          total: totalInCategory,
          percentage: Math.round((completedInCategory / totalInCategory) * 100)
        });
      }
    }

    const { data: challengeLevels } = await supabase
      .from('challenge_categories')
      .select('id, name, level')
      .eq('is_published', true)
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    const challengeLevelProgress = [];
    let totalChallengesCompleted = 0;
    let totalChallengesAvailable = 0;

    const levelGroups = {};
    for (const category of challengeLevels || []) {
      if (!levelGroups[category.level]) {
        levelGroups[category.level] = [];
      }
      levelGroups[category.level].push(category);
    }

    for (const [level, categories] of Object.entries(levelGroups)) {
      let completedInLevel = 0;
      let totalInLevel = categories.length;

      for (const category of categories) {
        const { data: sessions } = await supabase
          .from('attempt_sessions')
          .select('passed')
          .eq('child_id', childId)
          .eq('category_id', category.id)
          .eq('status', 'completed')
          .eq('passed', true)
          .limit(1);

        if (sessions && sessions.length > 0) {
          completedInLevel++;
        }
      }

      totalChallengesCompleted += completedInLevel;
      totalChallengesAvailable += totalInLevel;

      challengeLevelProgress.push({
        level: parseInt(level),
        completed: completedInLevel,
        total: totalInLevel,
        percentage: Math.round((completedInLevel / totalInLevel) * 100)
      });
    }

    const { count: unlockedAchievements } = await supabase
      .from('child_achievements')
      .select('*', { count: 'exact' })
      .eq('child_id', childId);

    const { count: totalAchievements } = await supabase
      .from('achievements')
      .select('*', { count: 'exact' });

    const totalItemsCompleted = totalLessonsCompleted + totalChallengesCompleted;
    const totalItemsAvailable = totalLessonsAvailable + totalChallengesAvailable;
    const overallPercentage = totalItemsAvailable > 0
      ? Math.round((totalItemsCompleted / totalItemsAvailable) * 100)
      : 0;

    res.status(200).json({
      currentLevel: child.level,
      totalStars: child.total_stars,
      currentStreak: child.current_streak,
      maxStreak: child.max_streak,

      lessonProgress: {
        byCategory: lessonCategoryProgress,
        totalCompleted: totalLessonsCompleted,
        totalAvailable: totalLessonsAvailable,
        percentage: totalLessonsAvailable > 0
          ? Math.round((totalLessonsCompleted / totalLessonsAvailable) * 100)
          : 0
      },

      challengeProgress: {
        byLevel: challengeLevelProgress,
        totalCompleted: totalChallengesCompleted,
        totalAvailable: totalChallengesAvailable,
        percentage: totalChallengesAvailable > 0
          ? Math.round((totalChallengesCompleted / totalChallengesAvailable) * 100)
          : 0
      },

      achievements: {
        unlocked: unlockedAchievements || 0,
        total: totalAchievements || 0,
        percentage: totalAchievements > 0
          ? Math.round(((unlockedAchievements || 0) / totalAchievements) * 100)
          : 0
      },

      overallProgress: {
        totalCompleted: totalItemsCompleted,
        totalAvailable: totalItemsAvailable,
        percentage: overallPercentage
      }
    });
  } catch (error) {
    console.error('Exception in getProgressSummary:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getLeaderboard,
  getProgressSummary
};
