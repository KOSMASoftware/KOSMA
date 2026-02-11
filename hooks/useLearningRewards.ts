
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLearningData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: responseData, error: apiError } = await supabase.functions.invoke('learning-progress-summary', {
            body: { include_rewards: true }
        });

        if (apiError) throw apiError;
        if (!responseData) throw new Error("No data received");

        setData(responseData as LearningRewardsResponse);
      } catch (e: any) {
        console.error("[LearningRewards] Fetch error:", e);
        setError(e.message || "Failed to load learning progress.");
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, []);

  return { data, loading, error };
};
