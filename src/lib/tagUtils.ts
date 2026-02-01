import { prisma } from './db';

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity percentage between two strings (0-100)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;

  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(similarity * 100) / 100;
}

/**
 * Find or create a tag, reusing existing similar tags (90%+ similarity)
 * @param tagName - The tag name to find or create
 * @param similarityThreshold - Minimum similarity percentage (default: 90)
 * @returns The found or created tag record
 */
export async function findOrCreateTag(
  tagName: string,
  similarityThreshold: number = 90
): Promise<{ id: string; name: string; isReused: boolean }> {
  const normalizedName = tagName.trim().toLowerCase();

  // First, check for exact match
  const exactMatch = await prisma.tags.findUnique({
    where: { name: normalizedName }
  });

  if (exactMatch) {
    return { id: exactMatch.id, name: exactMatch.name, isReused: true };
  }

  // Get all existing tags for similarity comparison
  const allTags = await prisma.tags.findMany({
    select: { id: true, name: true }
  });

  // Find the most similar tag above the threshold
  let bestMatch: { id: string; name: string; similarity: number } | null = null;

  for (const tag of allTags) {
    const similarity = calculateSimilarity(normalizedName, tag.name);
    if (similarity >= similarityThreshold) {
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { id: tag.id, name: tag.name, similarity };
      }
    }
  }

  // If a similar tag was found, reuse it
  if (bestMatch) {
    console.log(`[TagUtils] Reusing tag "${bestMatch.name}" (${bestMatch.similarity}% similar to "${normalizedName}")`);
    return { id: bestMatch.id, name: bestMatch.name, isReused: true };
  }

  // No similar tag found, create a new one
  const newTag = await prisma.tags.create({
    data: { name: normalizedName }
  });

  console.log(`[TagUtils] Created new tag "${normalizedName}"`);
  return { id: newTag.id, name: newTag.name, isReused: false };
}

/**
 * Process multiple tag names and return tag records (reusing similar ones)
 * @param tagNames - Array of tag names to process
 * @param similarityThreshold - Minimum similarity percentage (default: 90)
 * @returns Array of tag records with deduplicated results
 */
export async function processTags(
  tagNames: string[],
  similarityThreshold: number = 90
): Promise<{ id: string; name: string }[]> {
  const processedTagIds = new Set<string>();
  const results: { id: string; name: string }[] = [];

  for (const tagName of tagNames) {
    if (!tagName || !tagName.trim()) continue;

    const tag = await findOrCreateTag(tagName, similarityThreshold);

    // Avoid duplicates in the result
    if (!processedTagIds.has(tag.id)) {
      processedTagIds.add(tag.id);
      results.push({ id: tag.id, name: tag.name });
    }
  }

  return results;
}
