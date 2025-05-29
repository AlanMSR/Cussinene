import { useCallback } from 'react';

export const useDeepSeek = () => {
  const callDeepSeek = useCallback(
    async (prompt: string, options: { signal?: AbortSignal } = {}): Promise<string | undefined> => {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
            "X-Title": "cussinene"
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-prover-v2:free",
            messages: [
              {
                role: "user",
                content: prompt,
              }
            ]
          }),
          signal: options.signal
        });
  
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`DeepSeek error: ${response.status} - ${errorBody}`);
          return undefined;
        }
  
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request was aborted');
          throw error; // Re-throw abort errors to be handled by the component
        }
        console.error("DeepSeek fetch error:", error);
        return undefined;
      }
    }, 
    []
  );

  return { callDeepSeek };
};
