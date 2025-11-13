/**
 * Dev Server 中间件基类
 */

import type { IncomingMessage, ServerResponse } from 'http';

export type MiddlewareContext = {
  /** WebSocket 广播函数（用于触发 HMR） */
  sockWrite?: (type: string, data?: any) => void;
};

export type RequestHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void | Promise<void>;

/**
 * 解析请求体
 */
export function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

/**
 * 设置 CORS 头
 */
export function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * 发送 JSON 响应
 */
export function sendJson(res: ServerResponse, statusCode: number, data: any): void {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

/**
 * 发送错误响应
 */
export function sendError(
  res: ServerResponse,
  statusCode: number,
  message: string,
  details?: any
): void {
  sendJson(res, statusCode, {
    success: false,
    error: message,
    ...details,
  });
}

/**
 * 处理 OPTIONS 请求（CORS 预检）
 */
export function handleOptions(req: IncomingMessage, res: ServerResponse): boolean {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.statusCode = 200;
    res.end();
    return true;
  }
  return false;
}
