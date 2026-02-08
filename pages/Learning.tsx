
import React, { useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { COURSES } from '../data/learningCourses';
import { useAuth } from '../context/AuthContext';
import { Layout as DashboardLayout } from '../components/Layout';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { buildLearningUrl } from './learning/learningNav';

// Sub-Views
import { CourseCatalogView } from './learning/CourseCatalogView';
import { CourseOverviewView } from './learning/CourseOverviewView';
import { LessonView } from './learning/LessonView';
import { Loader2 } from 'lucide-react';

// --- MAIN PAGE CONTROLLER ---
const LearningPageContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  const selectedCourseId = searchParams.get('course');
  const selectedArticleId = searchParams.get('article');

  const selectedCourse = useMemo(() => 
    COURSES.find(c => c.id === selectedCourseId), 
  [selectedCourseId]);

  // Deep Link Gate: Prevent direct access via URL if not authenticated
  useEffect(() => {
    if (!isLoading && selectedCourseId && selectedArticleId && !isAuthenticated) {
        const target = buildLearningUrl({ courseId: selectedCourseId, articleId: selectedArticleId });
        navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true });
    }
  }, [selectedCourseId, selectedArticleId, isAuthenticated, isLoading, navigate]);

  const handleSelectCourse = (courseId: string) => {
    setSearchParams({ course: courseId });
    window.scrollTo(0, 0);
  };

  // GATED: User clicks "Start Course" or specific Goal in Overview
  const handleOverviewSelectGoal = (articleId: string) => {
    if (!selectedCourseId) return;

    if (!isAuthenticated) {
        const target = buildLearningUrl({ courseId: selectedCourseId, articleId });
        navigate(`/login?redirect=${encodeURIComponent(target)}`);
        return;
    }
    setSearchParams({ course: selectedCourseId, article: articleId });
  };

  // UNGATED: User clicks "Next Goal" inside a lesson (already in flow)
  const handleLessonNavigate = (articleId: string) => {
    if (!selectedCourseId) return;
    setSearchParams({ course: selectedCourseId, article: articleId });
  };

  const handleBackToOverview = () => {
    if (selectedCourseId) {
        setSearchParams({ course: selectedCourseId }); // Remove article param
    }
  };

  const handleBackToLanding = () => {
    setSearchParams({}); // Clear all
  };

  if (isLoading) {
      return (
        <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      );
  }

  // Prevent flash of content if deep link gate is about to trigger
  if (selectedCourseId && selectedArticleId && !isAuthenticated) {
      return null; 
  }

  // State Machine for Views
  if (selectedCourse && selectedArticleId) {
    return (
      <LessonView 
        course={selectedCourse} 
        articleId={selectedArticleId} 
        onBack={handleBackToOverview} 
        onNavigate={handleLessonNavigate} 
      />
    );
  }

  if (selectedCourse) {
    return (
      <CourseOverviewView 
        course={selectedCourse} 
        onBack={handleBackToLanding} 
        onSelectGoal={handleOverviewSelectGoal} 
      />
    );
  }

  return <CourseCatalogView onSelectCourse={handleSelectCourse} />;
};

export const LearningPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const Wrapper = isAuthenticated ? DashboardLayout : MarketingLayout;
  return <Wrapper><LearningPageContent /></Wrapper>;
};
