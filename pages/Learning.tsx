
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { COURSES } from '../data/learningCourses';
import { useAuth } from '../context/AuthContext';
import { Layout as DashboardLayout } from '../components/Layout';
import { MarketingLayout } from '../components/layout/MarketingLayout';

// Sub-Views
import { CourseCatalogView } from './learning/CourseCatalogView';
import { CourseOverviewView } from './learning/CourseOverviewView';
import { LessonView } from './learning/LessonView';

// --- MAIN PAGE CONTROLLER ---
const LearningPageContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedCourseId = searchParams.get('course');
  const selectedArticleId = searchParams.get('article');

  const selectedCourse = useMemo(() => 
    COURSES.find(c => c.id === selectedCourseId), 
  [selectedCourseId]);

  const handleSelectCourse = (courseId: string) => {
    setSearchParams({ course: courseId });
    window.scrollTo(0, 0);
  };

  const handleSelectGoal = (articleId: string) => {
    if (selectedCourseId) {
       setSearchParams({ course: selectedCourseId, article: articleId });
    }
  };

  const handleBackToOverview = () => {
    if (selectedCourseId) {
        setSearchParams({ course: selectedCourseId }); // Remove article param
    }
  };

  const handleBackToLanding = () => {
    setSearchParams({}); // Clear all
  };

  // State Machine for Views
  if (selectedCourse && selectedArticleId) {
    return (
      <LessonView 
        course={selectedCourse} 
        articleId={selectedArticleId} 
        onBack={handleBackToOverview} 
        onNavigate={handleSelectGoal} 
      />
    );
  }

  if (selectedCourse) {
    return (
      <CourseOverviewView 
        course={selectedCourse} 
        onBack={handleBackToLanding} 
        onSelectGoal={handleSelectGoal} 
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
