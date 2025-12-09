const supabase = require('../config/supabase');

const getUserStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const { count: totalChildren } = await supabase
      .from('children')
      .select('*', { count: 'exact', head: true });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const { data: newUsersDaily } = await supabase
      .from('children')
      .select('id')
      .gte('created_at', today.toISOString());

    const { data: newUsersWeekly } = await supabase
      .from('children')
      .select('id')
      .gte('created_at', weekAgo.toISOString());

    const { data: newUsersMonthly } = await supabase
      .from('children')
      .select('id')
      .gte('created_at', monthAgo.toISOString());

    const { data: activeUsersDaily } = await supabase
      .from('children')
      .select('id')
      .gte('last_activity_date', today.toISOString().split('T')[0]);

    const { data: activeUsersWeekly } = await supabase
      .from('children')
      .select('id')
      .gte('last_activity_date', weekAgo.toISOString().split('T')[0]);

    const { data: activeUsersMonthly } = await supabase
      .from('children')
      .select('id')
      .gte('last_activity_date', monthAgo.toISOString().split('T')[0]);

    const { data: ageDistribution } = await supabase
      .from('children')
      .select('age');

    const ages = {};
    (ageDistribution || []).forEach(child => {
      ages[child.age] = (ages[child.age] || 0) + 1;
    });

    const { data: genderDistribution } = await supabase
      .from('children')
      .select('sex');

    const genders = { male: 0, female: 0 };
    (genderDistribution || []).forEach(child => {
      genders[child.sex] = (genders[child.sex] || 0) + 1;
    });

    const { data: countryDistribution } = await supabase
      .from('children')
      .select('country');

    const countries = {};
    (countryDistribution || []).forEach(child => {
      if (child.country) {
        countries[child.country] = (countries[child.country] || 0) + 1;
      }
    });

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: retentionData } = await supabase
      .from('children')
      .select('id, created_at, last_activity_date')
      .gte('created_at', thirtyDaysAgo.toISOString());

    let retainedUsers = 0;
    (retentionData || []).forEach(child => {
      if (child.last_activity_date) {
        const daysSinceCreation = Math.floor(
          (now - new Date(child.created_at)) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCreation >= 7 && child.last_activity_date >= weekAgo.toISOString().split('T')[0]) {
          retainedUsers++;
        }
      }
    });

    const retentionRate = retentionData && retentionData.length > 0
      ? Math.round((retainedUsers / retentionData.length) * 100)
      : 0;

    const { data: usageStats } = await supabase
      .from('user_statistics')
      .select('total_time_minutes');

    const totalMinutes = (usageStats || []).reduce((sum, stat) => sum + (stat.total_time_minutes || 0), 0);
    const avgUsageTime = totalChildren > 0 ? Math.round(totalMinutes / totalChildren) : 0;

    res.status(200).json({
      totalRegisteredChildren: totalChildren || 0,
      newUsers: {
        daily: newUsersDaily?.length || 0,
        weekly: newUsersWeekly?.length || 0,
        monthly: newUsersMonthly?.length || 0
      },
      activeUsers: {
        daily: activeUsersDaily?.length || 0,
        weekly: activeUsersWeekly?.length || 0,
        monthly: activeUsersMonthly?.length || 0
      },
      demographics: {
        ageDistribution: ages,
        genderDistribution: genders,
        countryDistribution: countries
      },
      retentionRate,
      averageUsageTimeMinutes: avgUsageTime
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getActivityStatistics = async (req, res) => {
  try {
    const { count: totalLessonCompletions } = await supabase
      .from('lesson_completions')
      .select('*', { count: 'exact', head: true });

    const { count: totalChallengeCompletions } = await supabase
      .from('attempt_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { data: answerStats } = await supabase
      .from('attempt_answers')
      .select('is_correct');

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    (answerStats || []).forEach(answer => {
      if (answer.is_correct) correctAnswers++;
      else incorrectAnswers++;
    });

    const { data: lessonPopularity } = await supabase
      .from('lesson_completions')
      .select('lesson_id');

    const lessonCounts = {};
    (lessonPopularity || []).forEach(comp => {
      lessonCounts[comp.lesson_id] = (lessonCounts[comp.lesson_id] || 0) + 1;
    });

    const sortedLessons = Object.entries(lessonCounts)
      .sort((a, b) => b[1] - a[1]);

    const { data: mostUsedLessons } = sortedLessons.length > 0 ? await supabase
      .from('lessons')
      .select('id, title')
      .in('id', sortedLessons.slice(0, 10).map(([id]) => id)) : { data: [] };

    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id, title');

    const leastUsedLessonIds = (allLessons || [])
      .filter(lesson => !lessonCounts[lesson.id])
      .slice(0, 10);

    const { data: challengePopularity } = await supabase
      .from('attempt_sessions')
      .select('category_id')
      .eq('status', 'completed');

    const challengeCounts = {};
    (challengePopularity || []).forEach(session => {
      challengeCounts[session.category_id] = (challengeCounts[session.category_id] || 0) + 1;
    });

    const avgProgressRate = totalChallengeCompletions > 0
      ? Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100)
      : 0;

    const { data: sessionTimes } = await supabase
      .from('attempt_sessions')
      .select('created_at, completed_at')
      .eq('status', 'completed')
      .not('completed_at', 'is', null);

    let totalSessionTime = 0;
    (sessionTimes || []).forEach(session => {
      const start = new Date(session.created_at);
      const end = new Date(session.completed_at);
      totalSessionTime += (end - start) / 1000;
    });

    const avgTimePerActivity = sessionTimes && sessionTimes.length > 0
      ? Math.round(totalSessionTime / sessionTimes.length)
      : 0;

    const { data: activityEvents } = await supabase
      .from('activity_events')
      .select('event_type');

    const interactionCounts = {};
    (activityEvents || []).forEach(event => {
      interactionCounts[event.event_type] = (interactionCounts[event.event_type] || 0) + 1;
    });

    res.status(200).json({
      completions: {
        totalLessons: totalLessonCompletions || 0,
        totalChallenges: totalChallengeCompletions || 0
      },
      answers: {
        correct: correctAnswers,
        incorrect: incorrectAnswers,
        accuracy: correctAnswers + incorrectAnswers > 0
          ? Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100)
          : 0
      },
      popularity: {
        mostUsedLessons: (mostUsedLessons || []).map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          completions: lessonCounts[lesson.id] || 0
        })),
        leastUsedLessons: leastUsedLessonIds.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          completions: 0
        }))
      },
      averageProgressRate: avgProgressRate,
      averageTimePerActivitySeconds: avgTimePerActivity,
      interactionLevels: interactionCounts
    });
  } catch (error) {
    console.error('Get activity statistics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getTechnicalStatistics = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: logins } = await supabase
      .from('login_events')
      .select('device_type, logged_in_at')
      .gte('logged_in_at', weekAgo.toISOString());

    const deviceTypes = {};
    (logins || []).forEach(login => {
      if (login.device_type) {
        deviceTypes[login.device_type] = (deviceTypes[login.device_type] || 0) + 1;
      }
    });

    const { data: crashes } = await supabase
      .from('technical_events')
      .select('*')
      .eq('event_type', 'crash')
      .gte('created_at', weekAgo.toISOString());

    const { data: allEvents } = await supabase
      .from('technical_events')
      .select('event_type')
      .gte('created_at', weekAgo.toISOString());

    const crashRate = allEvents && allEvents.length > 0
      ? ((crashes?.length || 0) / allEvents.length) * 100
      : 0;

    const { data: performanceEvents } = await supabase
      .from('technical_events')
      .select('event_data')
      .eq('event_type', 'performance')
      .gte('created_at', weekAgo.toISOString());

    let totalLoadTime = 0;
    let loadTimeCount = 0;
    (performanceEvents || []).forEach(event => {
      if (event.event_data && event.event_data.loadTime) {
        totalLoadTime += event.event_data.loadTime;
        loadTimeCount++;
      }
    });

    const avgLoadTime = loadTimeCount > 0 ? Math.round(totalLoadTime / loadTimeCount) : 0;

    const { data: supportTickets } = await supabase
      .from('technical_events')
      .select('*')
      .eq('event_type', 'support_ticket')
      .gte('created_at', weekAgo.toISOString());

    res.status(200).json({
      loginCount: logins?.length || 0,
      deviceTypes,
      crashRate: Math.round(crashRate * 100) / 100,
      totalCrashes: crashes?.length || 0,
      averagePageLoadTimeMs: avgLoadTime,
      supportTicketsSubmitted: supportTickets?.length || 0
    });
  } catch (error) {
    console.error('Get technical statistics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getGeneralStatistics = async (req, res) => {
  try {
    const { data: countryData } = await supabase
      .from('children')
      .select('country');

    const countries = {};
    (countryData || []).forEach(child => {
      if (child.country) {
        countries[child.country] = (countries[child.country] || 0) + 1;
      }
    });

    const topCountries = Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, users: count }));

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentUsers } = await supabase
      .from('children')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { data: oldUsers } = await supabase
      .from('children')
      .select('created_at')
      .lt('created_at', thirtyDaysAgo.toISOString());

    const growthRate = oldUsers && oldUsers.length > 0
      ? Math.round(((recentUsers?.length || 0) / oldUsers.length) * 100)
      : 0;

    res.status(200).json({
      topCountries,
      userGrowthRate: growthRate,
      totalUsers: (recentUsers?.length || 0) + (oldUsers?.length || 0)
    });
  } catch (error) {
    console.error('Get general statistics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const trackLogin = async (req, res) => {
  try {
    const { deviceType, country } = req.body;
    const childId = req.user.id;

    await supabase
      .from('login_events')
      .insert({
        child_id: childId,
        device_type: deviceType,
        country: country
      });

    if (country) {
      await supabase
        .from('children')
        .update({ country })
        .eq('id', childId);
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('user_statistics')
      .select('id, login_count')
      .eq('child_id', childId)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_statistics')
        .update({
          login_count: existing.login_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('user_statistics')
        .insert({
          child_id: childId,
          date: today,
          login_count: 1,
          country,
          device_type: deviceType
        });
    }

    res.status(200).json({ success: true, message: 'Login tracked' });
  } catch (error) {
    console.error('Track login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const trackActivity = async (req, res) => {
  try {
    const { eventType, eventData } = req.body;
    const childId = req.user.id;

    await supabase
      .from('activity_events')
      .insert({
        child_id: childId,
        event_type: eventType,
        event_data: eventData
      });

    res.status(200).json({ success: true, message: 'Activity tracked' });
  } catch (error) {
    console.error('Track activity error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const trackTechnicalEvent = async (req, res) => {
  try {
    const { eventType, errorMessage, stackTrace, deviceInfo } = req.body;
    const childId = req.user?.id || null;

    await supabase
      .from('technical_events')
      .insert({
        child_id: childId,
        event_type: eventType,
        error_message: errorMessage,
        stack_trace: stackTrace,
        device_info: deviceInfo
      });

    res.status(200).json({ success: true, message: 'Technical event tracked' });
  } catch (error) {
    console.error('Track technical event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getUserStatistics,
  getActivityStatistics,
  getTechnicalStatistics,
  getGeneralStatistics,
  trackLogin,
  trackActivity,
  trackTechnicalEvent
};
