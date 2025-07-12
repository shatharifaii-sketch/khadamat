export interface SearchAnalytic {
  id: string;
  search_query: string;
  category?: string;
  location?: string;
  results_count: number;
  created_at: string;
  user_id?: string;
}

export interface ServiceAnalytic {
  id: string;
  service_id: string;
  action_type: 'view' | 'contact_click' | 'phone_click' | 'email_click';
  created_at: string;
  user_id?: string;
  service?: {
    title: string;
    category: string;
  };
}

export interface ConversationAnalytic {
  id: string;
  conversation_id: string;
  service_id: string;
  message_count: number;
  started_at: string;
  last_activity_at: string;
  status: string;
  service?: {
    title: string;
    category: string;
  };
}

export interface AnalyticsSummary {
  totalSearches: number;
  totalServiceViews: number;
  totalContacts: number;
  totalConversations: number;
  topSearchTerms: Array<{ query: string; count: number }>;
  topViewedServices: Array<{ service_id: string; title: string; views: number }>;
  topCategories: Array<{ category: string; searches: number; views: number }>;
}