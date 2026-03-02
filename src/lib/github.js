
export async function getReleases() {
    try {
        const res = await fetch('https://api.github.com/repos/zenyyxz/V-Nexus/releases', {
            next: { revalidate: 3600, tags: ['github_releases'] }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch releases');
        }

        return res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getReadme() {
    try {
        const res = await fetch('https://api.github.com/repos/zenyyxz/V-Nexus/readme', {
            headers: { 'Accept': 'application/vnd.github.v3.raw' },
            next: { revalidate: 3600, tags: ['github_releases'] }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch README');
        }

        return res.text();
    } catch (error) {
        console.error(error);
        return '';
    }
}
