'use server';

import { revalidateTag } from 'next/cache';

export async function revalidateGithubData() {
    try {
        revalidateTag('github_releases');
        return { success: true, message: 'GitHub data refreshed successfully!' };
    } catch (error) {
        console.error('Revalidation failed:', error);
        return { success: false, error: 'Failed to refresh data' };
    }
}
