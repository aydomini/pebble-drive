/**
 * 文件列表处理器
 */
import { initDatabase, getAllFiles } from '../services/database.js';

export async function handleListFiles(request, env) {
    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        // 初始化数据库（如果需要）
        await initDatabase(env);

        // 获取所有文件
        const files = await getAllFiles(env);

        return new Response(JSON.stringify(files), {
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
