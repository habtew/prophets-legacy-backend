const supabase = require('../config/supabase');

/**
 * Checks if a child has completed all required content
 * for their current level and promotes them safely.
 *
 * Safe to call after lesson or challenge completion.
 */
const checkAndPromoteLevel = async (childId) => {
  try {
    // 1. Get child's current level (SOURCE OF TRUTH)
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('level')
      .eq('id', childId)
      .single();

    if (childError || !child) {
      throw new Error('Child not found');
    }

    const currentLevel = child.level || 1;

    console.log(
      `[LevelManager] Checking promotion for child ${childId} at level ${currentLevel}`
    );

    // 2. LESSON PROGRESS CHECK
    const { data: levelLessons, error: lessonError } = await supabase
      .from('lessons')
      .select('id')
      .eq('level', currentLevel);

    if (lessonError) throw lessonError;

    const lessonIds = (levelLessons || []).map(l => l.id);
    const totalLessons = lessonIds.length;

    let completedLessonsCount = 0;

    if (totalLessons > 0) {
      const { count, error: completionError } = await supabase
        .from('lesson_completions')
        .select('id', { count: 'exact', head: true })
        .eq('child_id', childId)
        .in('lesson_id', lessonIds);

      if (completionError) throw completionError;
      completedLessonsCount = count || 0;
    }

    const lessonsRequirementMet =
      totalLessons === 0 || completedLessonsCount >= totalLessons;

    // 3. CHALLENGE PROGRESS CHECK
    const { data: levelCategories, error: catError } = await supabase
      .from('challenge_categories')
      .select('id')
      .eq('level', currentLevel)
      .eq('is_published', true);

    if (catError) throw catError;

    const categoryIds = (levelCategories || []).map(c => c.id);
    const totalCategories = categoryIds.length;

    let passedCategoriesCount = 0;

    if (totalCategories > 0) {
      const { data: passedSessions, error: sessionError } = await supabase
        .from('attempt_sessions')
        .select('category_id')
        .eq('child_id', childId)
        .eq('passed', true)
        .in('category_id', categoryIds);

      if (sessionError) throw sessionError;

      passedCategoriesCount = new Set(
        (passedSessions || []).map(s => s.category_id)
      ).size;
    }

    const challengesRequirementMet =
      totalCategories === 0 || passedCategoriesCount >= totalCategories;

    console.log(
      `[LevelManager] Progress — Lessons: ${completedLessonsCount}/${totalLessons}, ` +
      `Challenges: ${passedCategoriesCount}/${totalCategories}`
    );

    // 4. PROMOTION DECISION
    if (!lessonsRequirementMet || !challengesRequirementMet) {
      return {
        promoted: false,
        currentLevel,
        progress: {
          lessons: { completed: completedLessonsCount, total: totalLessons },
          challenges: { completed: passedCategoriesCount, total: totalCategories }
        }
      };
    }

    // 5. SAFE LEVEL UPDATE (RACE-CONDITION PROTECTED)
    const newLevel = currentLevel + 1;

    const { data: updated, error: updateError } = await supabase
      .from('children')
      .update({ level: newLevel })
      .eq('id', childId)
      .eq('level', currentLevel) // Critical race condition guard
      .select('level')
      .maybeSingle();

    if (updateError) throw updateError;

    if (!updated) {
      // Race condition hit: level changed while we were processing
      return {
        promoted: false,
        currentLevel
      };
    }

    console.log(
      `[LevelManager] Child ${childId} PROMOTED to level ${newLevel}`
    );

    return {
      promoted: true,
      previousLevel: currentLevel,
      newLevel
    };

  } catch (error) {
    console.error('[LevelManager] Promotion failed:', error);
    return {
      promoted: false,
      error: error.message
    };
  }
};

module.exports = { checkAndPromoteLevel };