const supabase = require('../config/supabase');
const { createAuthenticatedClient } = require('../config/supabase');

/**
 * Get main categories only (for admin)
 */
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
        title: c.title,
        description: c.description,
        imageUrl: c.image_url,
        level: c.level,
        orderIndex: c.order_index,
        isMainCategory: c.is_main_category
      }))
    });
  } catch (error) {
    console.error('Get main categories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get main category contents (subcategories + direct lessons)
 */
const getMainCategoryContents = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: mainCategory, error: categoryError } = await supabase
      .from('lesson_categories')
      .select('*')
      .eq('id', id)
      .eq('is_main_category', true)
      .maybeSingle();

    if (categoryError || !mainCategory) {
      return res.status(404).json({ success: false, message: 'Main category not found' });
    }

    const { data: subcategories } = await supabase
      .from('lesson_categories')
      .select('*')
      .eq('parent_category_id', id)
      .order('order_index');

    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('category_id', id)
      .order('created_at');

    // Combine into items array with type field
    const items = [
      ...(subcategories || []).map(c => ({
        type: 'category',
        id: c.id,
        title: c.title,
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
        audioUrl: l.audio_url,
        imageUrl: l.image_url,
        videoUrl: l.video_url,
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

/**
 * Get lessons in a subcategory
 */
const getSubcategoryLessons = async (req, res) => {
  try {
    const { mainCategoryId, subcategoryId } = req.params;

    const { data: mainCategory } = await supabase
      .from('lesson_categories')
      .select('id')
      .eq('id', mainCategoryId)
      .eq('is_main_category', true)
      .maybeSingle();

    if (!mainCategory) {
      return res.status(404).json({ success: false, message: 'Main category not found' });
    }

    const { data: subcategory, error: subcategoryError } = await supabase
      .from('lesson_categories')
      .select('*')
      .eq('id', subcategoryId)
      .eq('parent_category_id', mainCategoryId)
      .maybeSingle();

    if (subcategoryError || !subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found in this main category' });
    }

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
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
      audioUrl: l.audio_url,
      imageUrl: l.image_url,
      videoUrl: l.video_url,
      starsReward: l.stars_reward,
      level: l.level
    }));

    res.status(200).json({
      id: subcategory.id,
      title: subcategory.title,
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

const createMainCategory = async (req, res) => {
  try {
    const { title, level, description, imageUrl } = req.body;

    if (!title || !level) {
      return res.status(400).json({ success: false, message: 'title and level are required' });
    }

    const { data: existing } = await supabase
      .from('lesson_categories')
      .select('order_index')
      .is('parent_category_id', null)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existing && existing.length > 0 ? (existing[0].order_index + 1) : 0;

    const { data: category, error } = await supabase
      .from('lesson_categories')
      .insert({
        title,
        level,
        description: description || null,
        image_url: imageUrl || null,
        parent_category_id: null,
        is_main_category: true,
        order_index: nextOrderIndex
      })
      .select()
      .single();

    if (error) {
      console.error('Create main category error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create main category' });
    }

    res.status(201).json({
      success: true,
      categoryId: category.id,
      message: 'Main category created.'
    });
  } catch (error) {
    console.error('Create main category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createSubcategory = async (req, res) => {
  try {
    const { title, level, description, imageUrl, mainCategoryId } = req.body;

    if (!title || !level || !mainCategoryId) {
      return res.status(400).json({ success: false, message: 'title, level, and mainCategoryId are required' });
    }

    const { data: mainCategory } = await supabase
      .from('lesson_categories')
      .select('id, is_main_category')
      .eq('id', mainCategoryId)
      .eq('is_main_category', true)
      .maybeSingle();

    if (!mainCategory) {
      return res.status(400).json({ success: false, message: 'Main category not found' });
    }

    const { data: existing } = await supabase
      .from('lesson_categories')
      .select('order_index')
      .eq('parent_category_id', mainCategoryId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existing && existing.length > 0 ? (existing[0].order_index + 1) : 0;

    const { data: subcategory, error } = await supabase
      .from('lesson_categories')
      .insert({
        title,
        level,
        description: description || null,
        image_url: imageUrl || null,
        parent_category_id: mainCategoryId,
        is_main_category: false,
        order_index: nextOrderIndex
      })
      .select()
      .single();

    if (error) {
      console.error('Create subcategory error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create subcategory' });
    }

    res.status(201).json({
      success: true,
      subcategoryId: subcategory.id,
      message: 'Subcategory created.'
    });
  } catch (error) {
    console.error('Create subcategory error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateLessonCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, level, description, imageUrl, orderIndex } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (level !== undefined) updates.level = level;
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (orderIndex !== undefined) updates.order_index = orderIndex;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const { error } = await supabase
      .from('lesson_categories')
      .update(updates)
      .eq('id', id);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to update category' });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteLessonCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('lesson_categories')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete category' });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllLessons = async (req, res) => {
  try {
    const { page = 1, filterByCategoryId, sortByLevel } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('lessons')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (filterByCategoryId) {
      query = query.eq('category_id', filterByCategoryId);
    }

    if (sortByLevel) {
      query = query.order('level', { ascending: sortByLevel === 'asc' });
    }

    const { data: lessons, error, count } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch lessons' });
    }

    res.status(200).json({
      lessons: lessons || [],
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createLesson = async (req, res) => {
  try {
    console.log('Create lesson request body:', req.body);
    const { categoryId, level, title, description, audioUrl, imageUrl, videoUrl, starsReward } = req.body;

    if (!categoryId || !level || !title) {
      console.error('Missing required fields:', { categoryId, level, title });
      return res.status(400).json({
        success: false,
        message: 'categoryId, level, and title are required',
        received: { categoryId, level, title }
      });
    }

    // Validate category exists
    const { data: category } = await supabase
      .from('lesson_categories')
      .select('id, title, parent_category_id')
      .eq('id', categoryId)
      .maybeSingle();

    if (!category) {
      return res.status(400).json({ success: false, message: 'Category not found' });
    }

    // Auto-calculate order_index
    const { data: existing } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existing && existing.length > 0 ? (existing[0].order_index + 1) : 0;

    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        category_id: categoryId,
        level,
        title,
        description,
        audio_url: audioUrl,
        image_url: imageUrl,
        video_url: videoUrl,
        stars_reward: starsReward || 5,
        order_index: nextOrderIndex
      })
      .select()
      .single();

    if (error) {
      console.error('Create lesson error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create lesson' });
    }

    res.status(201).json({
      success: true,
      lessonId: lesson.id,
      message: 'Lesson created.'
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, level, categoryId, audioUrl, imageUrl, videoUrl } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Lesson ID is required' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (level !== undefined) updates.level = level;
    if (categoryId !== undefined) updates.category_id = categoryId;
    if (audioUrl !== undefined) updates.audio_url = audioUrl;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (videoUrl !== undefined) updates.video_url = videoUrl;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update lesson error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update lesson', details: error.message });
    }

    if (!data) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Lesson updated.',
      lesson: data
    });
  } catch (error) {
    console.error('Update lesson exception:', error);
    res.status(500).json({ success: false, message: 'Internal server error', details: error.message });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete lesson' });
    }

    res.status(200).json({
      success: true,
      message: 'Lesson deleted.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllChallengeCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('challenge_categories')
      .select('*, challenge_questions(id)')
      .order('level', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }

    res.status(200).json((categories || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      level: cat.level,
      questionCount: cat.challenge_questions?.length || 0,
      isPublished: cat.is_published
    })));
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createChallengeCategory = async (req, res) => {
  try {
    const { name, level, passPercentage } = req.body;

    if (!name || !level) {
      return res.status(400).json({ success: false, message: 'name and level are required' });
    }

    const authClient = createAuthenticatedClient(req.token);
    const { data: category, error } = await authClient
      .from('challenge_categories')
      .insert({
        name,
        level,
        pass_percentage: passPercentage || 70,
        is_published: false
      })
      .select()
      .single();

    if (error) {
      console.error('Create challenge category error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create category', details: error.message });
    }

    res.status(201).json({
      categoryId: category.id,
      message: 'Challenge Category created. It is currently in draft.'
    });
  } catch (error) {
    console.error('Create challenge category exception:', error);
    res.status(500).json({ success: false, message: 'Internal server error', details: error.message });
  }
};

const updateChallengeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, passPercentage, published } = req.body;

    if (published) {
      const { count } = await supabase
        .from('challenge_questions')
        .select('*', { count: 'exact' })
        .eq('category_id', id);

      if ((count || 0) < 3) {
        return res.status(400).json({
          success: false,
          message: 'Cannot publish: Category must have at least 3 questions.'
        });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (passPercentage) updates.pass_percentage = passPercentage;
    if (published !== undefined) updates.is_published = published;

    const authClient = createAuthenticatedClient(req.token);
    const { error } = await authClient
      .from('challenge_categories')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Update challenge category error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update category', details: error.message });
    }

    res.status(200).json({
      success: true,
      message: `Category updated. Status: ${published ? 'Published' : 'Draft'}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteChallengeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const authClient = createAuthenticatedClient(req.token);
    const { error } = await authClient
      .from('challenge_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete challenge category error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete category', details: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Category and questions deleted.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getQuestionTypes = async (req, res) => {
  try {
    res.status(200).json({
      questionTypes: [
        { id: 'letter_arrangement', name: 'Letter Arrangement' },
        { id: 'multiple_choice', name: 'Multiple Choice' },
        { id: 'missing_word', name: 'Missing Word (Fill in the Blank)' },
        { id: 'crossword', name: 'Crossword' },
        { id: 'word_ordering', name: 'Word Ordering' },
        { id: 'tap_counter', name: 'Tap Counter (Repeat Phrase)' },
        { id: 'word_to_word_match', name: 'Word-to-Word Matching' },
        { id: 'word_to_image_match', name: 'Word-to-Image Matching' },
        { id: 'audio_recording', name: 'Audio Recording (Echo/Repeat)' },
        { id: 'sentence_completion_chips', name: 'Complete the Sentence (Chips)' }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getChallengeQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: questions, error } = await supabase
      .from('challenge_questions')
      .select('*')
      .eq('category_id', id)
      .order('order_index', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }

    res.status(200).json(questions || []);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addChallengeQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, question, options, answer, timeLimitSec } = req.body;

    if (!type || !question || !options || !answer) {
      return res.status(400).json({ success: false, message: 'type, question, options, and answer are required' });
    }

    const { count } = await supabase
      .from('challenge_questions')
      .select('*', { count: 'exact' })
      .eq('category_id', id);

    const authClient = createAuthenticatedClient(req.token);
    const { data: newQuestion, error } = await authClient
      .from('challenge_questions')
      .insert({
        category_id: id,
        type,
        question,
        options,
        answer,
        time_limit_sec: timeLimitSec || 30,
        order_index: count || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Add challenge question error:', error);
      return res.status(500).json({ success: false, message: 'Failed to add question', details: error.message });
    }

    res.status(201).json({
      questionId: newQuestion.id,
      message: 'Question added.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateChallengeQuestion = async (req, res) => {
  try {
    const { id, qid } = req.params;
    const { type, question, options, answer, timeLimitSec } = req.body;

    const updates = {};
    if (type) updates.type = type;
    if (question) updates.question = question;
    if (options) updates.options = options;
    if (answer !== undefined) updates.answer = answer;
    if (timeLimitSec) updates.time_limit_sec = timeLimitSec;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    console.log('Updating question:', qid, 'in category:', id, 'with:', updates);

    const { data, error } = await supabase
      .from('challenge_questions')
      .update(updates)
      .eq('id', qid)
      .eq('category_id', id)
      .select();

    if (error) {
      console.error('Update challenge question error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update question', error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    console.log('Question updated successfully:', data[0]);

    res.status(200).json({
      success: true,
      message: 'Question updated.'
    });
  } catch (error) {
    console.error('Exception in updateChallengeQuestion:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteChallengeQuestion = async (req, res) => {
  try {
    const { id, qid } = req.params;

    const { error } = await supabase
      .from('challenge_questions')
      .delete()
      .eq('id', qid)
      .eq('category_id', id);

    if (error) {
      console.error('Delete challenge question error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete question', error: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted.'
    });
  } catch (error) {
    console.error('Exception in deleteChallengeQuestion:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const reorderQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderedQuestionIds } = req.body;

    if (!orderedQuestionIds || !Array.isArray(orderedQuestionIds)) {
      return res.status(400).json({ success: false, message: 'orderedQuestionIds must be an array' });
    }

    const authClient = createAuthenticatedClient(req.token);
    for (let i = 0; i < orderedQuestionIds.length; i++) {
      await authClient
        .from('challenge_questions')
        .update({ order_index: i })
        .eq('id', orderedQuestionIds[i])
        .eq('category_id', id);
    }

    res.status(200).json({
      success: true,
      message: 'Questions reordered.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllChildren = async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('children')
      .select('id, username, display_name, age, sex, level, total_stars, current_streak, avatar_url, created_at', { count: 'exact' });

    if (search) {
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%,id.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: children, error, count } = await query;

    if (error) {
      console.error('Get children error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch children', details: error.message });
    }

    res.status(200).json({
      success: true,
      children: children || [],
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get children exception:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getMainCategories,
  getMainCategoryContents,
  getSubcategoryLessons,
  createMainCategory,
  createSubcategory,
  updateLessonCategory,
  deleteLessonCategory,
  getAllLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getAllChallengeCategories,
  createChallengeCategory,
  updateChallengeCategory,
  deleteChallengeCategory,
  getQuestionTypes,
  getChallengeQuestions,
  addChallengeQuestion,
  updateChallengeQuestion,
  deleteChallengeQuestion,
  reorderQuestions,
  getAllChildren
};
