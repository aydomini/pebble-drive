/**
 * 格式化工具函数
 */

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes, targetUnit = null) {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];

    if (targetUnit) {
        const unitIndex = units.indexOf(targetUnit);
        const size = (bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex === 0 ? 0 : 2);
        return size + ' ' + targetUnit;
    } else {
        const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
        const size = (bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex === 0 ? 0 : 2);
        return size + ' ' + units[unitIndex];
    }
}

/**
 * 格式化日期
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return diffDays + '天前';

    return date.toLocaleDateString('zh-CN');
}

/**
 * 获取文件图标
 */
export function getFileIcon(type) {
    if (type.startsWith('image/')) return 'fa-file-image';
    if (type.startsWith('video/')) return 'fa-file-video';
    if (type.startsWith('audio/')) return 'fa-file-audio';
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('word')) return 'fa-file-word';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'fa-file-excel';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'fa-file-powerpoint';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'fa-file-archive';
    if (type.includes('text')) return 'fa-file-alt';
    return 'fa-file';
}

/**
 * 获取文件图标颜色
 */
export function getFileIconColor(type) {
    if (type.startsWith('image/')) return 'text-green-600';
    if (type.startsWith('video/')) return 'text-purple-600';
    if (type.startsWith('audio/')) return 'text-pink-600';
    if (type.includes('pdf')) return 'text-red-600';
    if (type.includes('word')) return 'text-blue-600';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'text-green-600';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'text-orange-600';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'text-yellow-600';
    if (type.includes('text')) return 'text-gray-600';
    return 'text-gray-500';
}

/**
 * 转义HTML
 */
export function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * 防抖函数
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
