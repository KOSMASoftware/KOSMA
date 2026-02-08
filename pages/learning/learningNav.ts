
export interface LearningParams {
  courseId?: string | null;
  articleId?: string | null;
}

export const buildLearningUrl = (params: LearningParams): string => {
  const query = new URLSearchParams();
  if (params.courseId) query.set('course', params.courseId);
  if (params.articleId) query.set('article', params.articleId);
  
  const queryString = query.toString();
  return queryString ? `/learning?${queryString}` : '/learning';
};

export const parseLearningParams = (searchParams: URLSearchParams): LearningParams => {
  return {
    courseId: searchParams.get('course'),
    articleId: searchParams.get('article')
  };
};
