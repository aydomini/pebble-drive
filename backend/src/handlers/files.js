/**
 * 文件列表处理器
 */
import { initDatabase, getAllFiles, getFilesPaginated } from '../services/database.js';

export async function handleListFiles(request, env) {
    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        // 初始化数据库（如果需要）
        await initDatabase(env);

        // 解析查询参数
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const pageSize = parseInt(url.searchParams.get('pageSize')) || 10;
        const search = url.searchParams.get('search') || '';
        const sortBy = url.searchParams.get('sortBy') || 'uploadDate';
        const sortOrder = url.searchParams.get('sortOrder') || 'desc';

        // 获取分页文件
        const result = await getFilesPaginated(env, {
            page,
            pageSize,
            search,
            sortBy,
            sortOrder
        });

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('List files error:', error);
        return new Response(JSON.stringify({
            error: error.message,
            details: error.stack
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
