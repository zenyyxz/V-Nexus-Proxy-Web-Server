
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import 'github-markdown-css/github-markdown.css';
import styles from './page.module.css';
import { getReadme } from '../../lib/github';

export const metadata = {
    title: 'V-Nexus Client - Overview',
    description: 'Overview and documentation for V-Nexus Client.',
};

const transformUrl = (url) => {
    if (url.startsWith('http') || url.startsWith('//')) return url;
    // Clean up relative paths
    let cleanUrl = url;
    if (cleanUrl.startsWith('./')) cleanUrl = cleanUrl.slice(2);
    if (cleanUrl.startsWith('/')) cleanUrl = cleanUrl.slice(1);

    // transform relative paths to github raw content
    return `https://raw.githubusercontent.com/zenyyxz/V-Nexus/master/${cleanUrl}`;
}

export default async function OverviewPage() {
    const readmeContent = await getReadme();

    return (
        <div className={`fade-in-up ${styles.readmeContainer}`}>
            <div className={`${styles.markdownContent} markdown-body`} style={{ backgroundColor: 'transparent' }}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    urlTransform={transformUrl}
                >
                    {readmeContent}
                </ReactMarkdown>
            </div>
        </div>
    );
}
