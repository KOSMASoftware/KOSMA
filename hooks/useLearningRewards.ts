
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface LearningRewardsResponse {
  global: {
    courses_completed_count: number;
    current_badge: 'Novice' | 'Skilled' | 'Expert' | null;
    next_badge: 'Novice' | 'Skilled' | 'Expert' | null;
    courses_to_next_badge: number;
    last_learning_activity_at: string;
  };
  courses: Array<{
    course_id: string;
    course_title: string;
    catalog_version: number;
    total_goals: number;
    completed_goals: number;
    opened_goals: number;
    course_completed: boolean;
    last_activity_at: string;
    last_article_id: string;
    continue_url: string;
  }>;
  rewards: {
    history: Array<{
      reward_key: string;
      reward_display_name: string;
      status: 'granted' | 'pending' | 'failed';
      granted_at: string;
      stripe_action_id?: string;
      meta?: any;
    }>;
    next_milestone?: {
      type: string;
      description: string;
    };
  };
}

export const useLearningRewards = () => {
  const [data, setData] = useState<LearningRewardsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearningData = async () => {
      setLoading(true);
      try {
        // MOCK: Simulate API Call to 'learning-progress-summary'
        // In real impl: const { data } = await supabase.functions.invoke('learning-progress-summary', { body: { include_rewards: true } });
        
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockResponse: LearningRewardsResponse = {
          global: {
            courses_completed_count: 3,
            current_badge: 'Skilled',
            next_badge: 'Expert',
            courses_to_next_badge: 3,
            last_learning_activity_at: new Date().toISOString()
          },
          courses: [
            {
              course_id: "intro-budgeting",
              course_title: "Introduction to Budgeting",
              catalog_version: 2,
              total_goals: 10,
              completed_goals: 10,
              opened_goals: 10,
              course_completed: true,
              last_activity_at: "2023-10-25T14:00:00Z",
              last_article_id: "A3",
              continue_url: "/learning?course=intro-budgeting"
            },
            {
              course_id: "intro-cashflow",
              course_title: "Introduction to Cashflow",
              catalog_version: 1,
              total_goals: 5,
              completed_goals: 5,
              opened_goals: 5,
              course_completed: true,
              last_activity_at: "2023-11-02T09:30:00Z",
              last_article_id: "D3",
              continue_url: "/learning?course=intro-cashflow"
            },
            {
              course_id: "intro-cost-control",
              course_title: "Introduction to Cost Control",
              catalog_version: 1,
              total_goals: 3,
              completed_goals: 3,
              opened_goals: 3,
              course_completed: true,
              last_activity_at: "2023-11-10T11:15:00Z",
              last_article_id: "E7",
              continue_url: "/learning?course=intro-cost-control"
            },
            {
              course_id: "adv-budgeting",
              course_title: "Advanced Budgeting",
              catalog_version: 1,
              total_goals: 11,
              completed_goals: 4,
              opened_goals: 6,
              course_completed: false,
              last_activity_at: new Date().toISOString(),
              last_article_id: "B4",
              continue_url: "/learning?course=adv-budgeting&article=B4"
            }
          ],
          rewards: {
            history: [
              {
                reward_key: "course_month_free:intro-budgeting",
                reward_display_name: "1 Month Free - Intro Budgeting",
                status: "granted",
                granted_at: "2023-10-25T14:05:00Z",
                stripe_action_id: "cp_123456"
              },
              {
                reward_key: "course_month_free:intro-cashflow",
                reward_display_name: "1 Month Free - Intro Cashflow",
                status: "granted",
                granted_at: "2023-11-02T09:35:00Z",
                stripe_action_id: "cp_789012"
              },
              {
                reward_key: "course_month_free:intro-cost-control",
                reward_display_name: "1 Month Free - Intro Cost Control",
                status: "pending", // Simulate pending state
                granted_at: "2023-11-10T11:20:00Z"
              }
            ],
            next_milestone: {
              type: "single_course_reward",
              description: "Complete 1 more course to unlock 1 month free"
            }
          }
        };

        setData(mockResponse);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, []);

  return { data, loading };
};
