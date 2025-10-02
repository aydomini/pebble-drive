/**
 * 验证工具函数
 */

/**
 * 检查是否为图片文件
 */
export function isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(extension);
}

/**
 * 检查是否为文本文件
 */
export function isTextFile(filename) {
    const textExtensions = [
        '.txt', '.md', '.rst', '.org',
        '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
        '.py', '.java', '.c', '.cpp', '.h', '.cs', '.go', '.rs',
        '.php', '.rb', '.swift', '.html', '.css', '.json', '.xml'
    ];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return textExtensions.includes(extension);
}

/**
 * 检查是否为Markdown文件
 */
export function isMarkdownFile(filename) {
    const markdownExtensions = ['.md', '.markdown', '.mdown', '.mkdn'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return markdownExtensions.includes(extension);
}

/**
 * 获取代码语言类型
 */
export function getCodeLanguage(filename) {
    const languageMap = {
        '.js': 'javascript',
        '.jsx': 'jsx',
        '.ts': 'typescript',
        '.tsx': 'tsx',
        '.py': 'python',
        '.java': 'java',
        '.c': 'c',
        '.cpp': 'cpp',
        '.html': 'html',
        '.css': 'css',
        '.json': 'json'
    };

    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return languageMap[extension] || 'plaintext';
}

/**
 * 验证文件大小
 */
export function validateFileSize(size, maxSize = 100 * 1024 * 1024) {
    return size <= maxSize;
}
