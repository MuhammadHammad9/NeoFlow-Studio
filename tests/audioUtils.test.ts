import { describe, it, expect, vi, beforeEach } from 'vitest';
import { blobToBase64 } from '../utils/audioUtils';

describe('audioUtils', () => {
  describe('blobToBase64', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should convert a blob to base64 string', async () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      
      const result = await blobToBase64(mockBlob);
      
      // The mock FileReader returns 'data:text/plain;base64,dGVzdA=='
      // After splitting at comma, we should get 'dGVzdA=='
      expect(result).toBe('dGVzdA==');
    });

    it('should handle audio blob', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/wav' });
      
      const result = await blobToBase64(mockBlob);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle image blob', async () => {
      const mockBlob = new Blob(['image data'], { type: 'image/png' });
      
      const result = await blobToBase64(mockBlob);
      
      expect(typeof result).toBe('string');
    });
  });
});
