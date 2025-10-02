/**
 * 错误处理中间件
 */
export function errorHandler(error) {
    console.error('Error:', error);

    return new Response(JSON.stringify({
        error: error.message || 'Internal Server Error',
        details: error.stack
    }), {
        status: error.status || 500,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

/**
 * 创建错误响应
 */
export function createErrorResponse(message, status = 400) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
