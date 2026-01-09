import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPeople,
  fetchPerson,
  fetchPersonAssets,
  fetchAssets,
  fetchAssetPeople,
  fetchNews,
  fetchPersonNews,
  fetchStats,
  crawlNews,
  analyzeArticle,
  computeInfluence,
  seedDatabase,
  Person,
  Asset,
  NewsArticle,
} from '@/lib/api/influence-graph';

// Hook to fetch all people
export function usePeople(options?: { limit?: number; industry?: string; search?: string }) {
  return useQuery({
    queryKey: ['people', options],
    queryFn: () => fetchPeople(options),
  });
}

// Hook to fetch a single person
export function usePerson(id: string | undefined) {
  return useQuery({
    queryKey: ['person', id],
    queryFn: () => fetchPerson(id!),
    enabled: !!id,
  });
}

// Hook to fetch assets related to a person
export function usePersonAssets(personId: string | undefined) {
  return useQuery({
    queryKey: ['personAssets', personId],
    queryFn: () => fetchPersonAssets(personId!),
    enabled: !!personId,
  });
}

// Hook to fetch all assets ranked by influence
export function useAssets(options?: { limit?: number; sector?: string; search?: string }) {
  return useQuery({
    queryKey: ['assets', options],
    queryFn: () => fetchAssets(options),
  });
}

// Hook to fetch people related to an asset
export function useAssetPeople(assetId: string | undefined) {
  return useQuery({
    queryKey: ['assetPeople', assetId],
    queryFn: () => fetchAssetPeople(assetId!),
    enabled: !!assetId,
  });
}

// Hook to fetch news articles
export function useNews(options?: { limit?: number; sentiment?: string; search?: string }) {
  return useQuery({
    queryKey: ['news', options],
    queryFn: () => fetchNews(options),
  });
}

// Hook to fetch news for a specific person
export function usePersonNews(personId: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ['personNews', personId, limit],
    queryFn: () => fetchPersonNews(personId!, limit),
    enabled: !!personId,
  });
}

// Hook to fetch dashboard stats
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });
}

// Hook to crawl news
export function useCrawlNews() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (query?: string) => crawlNews(query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

// Hook to analyze an article
export function useAnalyzeArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: analyzeArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
}

// Hook to compute influence scores
export function useComputeInfluence() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: computeInfluence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// Hook to seed the database
export function useSeedDatabase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: seedDatabase,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
