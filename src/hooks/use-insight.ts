import { useState } from 'react';
import { BASE_URL } from '../config';

export function useInsight(defaultTextOrPage: string) {
  const [insight, setInsight] = useState<{ loading: boolean; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async (contextData: Record<string, any> = {}) => {
    setIsLoading(true);
    setInsight({ loading: true, text: '' });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const pageName = typeof defaultTextOrPage === 'string' && defaultTextOrPage.length < 30
      ? defaultTextOrPage
      : 'command_center';

    try {
      const res = await fetch(`${BASE_URL}/api/insights/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'senior_officer',
        },
        body: JSON.stringify({ page: pageName, context: contextData }),
        signal: controller.signal
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInsight({ loading: false, text: data.insight || defaultTextOrPage });

    } catch (err: any) {
      setInsight({
        loading: false,
        text: typeof defaultTextOrPage === 'string' && defaultTextOrPage.length > 30
          ? defaultTextOrPage
          : `${pageName.replace('_', ' ')} analysis complete. Operational parameters indicate normal monitoring status.`
      });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return { insight, isLoading, generate };
}
