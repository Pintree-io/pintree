'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from 'next/cache';

/**
 * Revalidate data for a specific path or entire cache
 * @param path Optional path to revalidate
 * @param type Optional revalidation type (path or layout)
 */
export async function revalidateData(path?: string, type: 'path' | 'layout' = 'path') {
  try {
    if (path) {
      if (type === 'path') {
        revalidatePath(path);
      } else {
        revalidatePath(path, 'layout');
      }
      return { success: true, message: `Successfully revalidated ${path}` };
    } else {
      // If no path is provided, revalidate entire cache
      revalidatePath('/', 'layout');
      return { success: true, message: 'Successfully revalidated entire cache' };
    }
  } catch (error) {
    console.error('Revalidation error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown revalidation error' 
    };
  }
}
