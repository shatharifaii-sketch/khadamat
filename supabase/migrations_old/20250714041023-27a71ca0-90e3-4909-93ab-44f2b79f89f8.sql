-- Create helper functions for analytics dashboard

-- Function to get top search terms
CREATE OR REPLACE FUNCTION public.get_top_search_terms()
RETURNS TABLE(query TEXT, count BIGINT)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    search_query as query,
    COUNT(*) as count
  FROM public.search_analytics
  GROUP BY search_query
  ORDER BY count DESC;
$$;

-- Function to get category analytics
CREATE OR REPLACE FUNCTION public.get_category_analytics()
RETURNS TABLE(category TEXT, searches BIGINT, views BIGINT)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    s.category,
    COALESCE(search_count.searches, 0) as searches,
    COALESCE(view_count.views, 0) as views
  FROM (
    SELECT DISTINCT category FROM public.services WHERE category IS NOT NULL
  ) s
  LEFT JOIN (
    SELECT 
      category,
      COUNT(*) as searches
    FROM public.search_analytics
    WHERE category IS NOT NULL
    GROUP BY category
  ) search_count ON s.category = search_count.category
  LEFT JOIN (
    SELECT 
      s.category,
      COUNT(*) as views
    FROM public.service_analytics sa
    JOIN public.services s ON sa.service_id = s.id
    WHERE sa.action_type = 'view'
    GROUP BY s.category
  ) view_count ON s.category = view_count.category
  ORDER BY (COALESCE(search_count.searches, 0) + COALESCE(view_count.views, 0)) DESC;
$$;