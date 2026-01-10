/**
 * Environment variable validation and access utilities
 * Provides type-safe access to environment variables with validation
 */

// Declare Vite's import.meta.env types
declare global {
  interface ImportMeta {
    readonly env: {
      readonly MODE: string;
      readonly DEV: boolean;
      readonly PROD: boolean;
    };
  }
}

/**
 * Validates that all required environment variables are set
 * Throws an error if any required variables are missing
 */
export const validateEnv = (): void => {
  const missingVars: string[] = [];
  
  // In production, API_KEY is required
  if (!process.env.API_KEY || process.env.API_KEY.trim() === '') {
    missingVars.push('API_KEY (GEMINI_API_KEY)');
  }
  
  if (missingVars.length > 0) {
    console.warn(
      `[NeoFlow] Warning: The following environment variables are not set: ${missingVars.join(', ')}. ` +
      `Some features may not work correctly.`
    );
  }
};

/**
 * Gets the API key for Gemini services
 * Returns null if not set
 */
export const getApiKey = (): string | null => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return apiKey;
};

/**
 * Checks if the application is running in development mode
 */
export const isDevelopment = (): boolean => {
  try {
    return import.meta.env.DEV === true;
  } catch {
    return false;
  }
};

/**
 * Checks if the application is running in production mode
 */
export const isProduction = (): boolean => {
  try {
    return import.meta.env.PROD === true;
  } catch {
    return true; // Default to production for safety
  }
};

/**
 * Gets environment information for debugging
 */
export const getEnvInfo = (): { mode: string; hasApiKey: boolean } => {
  let mode = 'unknown';
  try {
    mode = import.meta.env.MODE;
  } catch {
    // Fallback if import.meta.env is not available
  }
  return {
    mode,
    hasApiKey: !!getApiKey(),
  };
};
