/**
 * AI 翻译服务
 * 通过 OpenRouter 平台调用大模型进行翻译
 */

const https = require('https');

/**
 * OpenRouter API 配置
 * 可以通过环境变量配置，或使用默认值
 */
const OPENROUTER_CONFIG = {
  apiKey: process.env.OPENROUTER_API_KEY || '',
  apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
  siteName: process.env.SITE_NAME || 'I18N Debug Tool',
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',
};

/**
 * 生成翻译提示词
 * @param {string} chineseText - 中文文本
 * @param {number} candidateCount - 候选词数量
 * @returns {string} - 提示词
 */
function generateTranslationPrompt(chineseText, candidateCount = 3) {
  return `请将以下中文文本翻译成英文，提供 ${candidateCount} 个不同的翻译候选项。要求：

1. 翻译要准确、自然、符合英文表达习惯
2. 如果文本包含占位符（如 {val1}, {val2}），必须在翻译中保留这些占位符
3. 候选项之间应该有一定差异（如正式/口语、简洁/详细等）
4. 直接返回 JSON 格式，不要有任何其他说明文字

中文文本：
${chineseText}

请返回以下 JSON 格式（只返回 JSON，不要有其他内容）：
{
  "translations": [
    {
      "text": "第一个翻译",
      "style": "正式"
    },
    {
      "text": "第二个翻译",
      "style": "简洁"
    },
    {
      "text": "第三个翻译",
      "style": "详细"
    }
  ]
}`;
}

/**
 * 调用 OpenRouter API
 * @param {string} chineseText - 中文文本
 * @param {number} candidateCount - 候选词数量
 * @returns {Promise<Array<{text: string, style: string}>>} - 翻译候选项
 */
function callOpenRouter(chineseText, candidateCount = 3) {
  return new Promise((resolve, reject) => {
    // 检查 API Key
    if (!OPENROUTER_CONFIG.apiKey) {
      reject(new Error('OpenRouter API Key 未配置，请设置环境变量 OPENROUTER_API_KEY'));
      return;
    }

    const prompt = generateTranslationPrompt(chineseText, candidateCount);

    const requestBody = JSON.stringify({
      model: OPENROUTER_CONFIG.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        Authorization: `Bearer ${OPENROUTER_CONFIG.apiKey}`,
        'HTTP-Referer': OPENROUTER_CONFIG.siteUrl,
        'X-Title': OPENROUTER_CONFIG.siteName,
      },
    };

    const req = https.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          // 检查响应状态
          if (res.statusCode !== 200) {
            console.error('❌ OpenRouter API 错误:', response);
            reject(new Error(response.error?.message || `API 请求失败: ${res.statusCode}`));
            return;
          }

          // 解析返回的内容
          const content = response.choices?.[0]?.message?.content;
          if (!content) {
            reject(new Error('API 返回内容为空'));
            return;
          }

          // 解析 JSON 内容
          let translations;
          try {
            // 尝试直接解析
            const parsed = JSON.parse(content);
            translations = parsed.translations;
          } catch {
            // 如果直接解析失败，尝试提取 JSON 部分
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              translations = parsed.translations;
            } else {
              throw new Error('无法解析 AI 返回的 JSON 格式');
            }
          }

          if (!Array.isArray(translations) || translations.length === 0) {
            reject(new Error('翻译结果格式错误'));
            return;
          }

          resolve(translations);
        } catch (error) {
          console.error('❌ 解析 OpenRouter 响应失败:', error);
          reject(error);
        }
      });
    });

    req.on('error', error => {
      console.error('❌ OpenRouter 请求失败:', error);
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * 翻译中文到英文（主函数）
 * @param {string} chineseText - 中文文本
 * @param {number} candidateCount - 候选词数量
 * @returns {Promise<Array<{text: string, style: string}>>} - 翻译候选项
 */
async function translateToEnglish(chineseText, candidateCount = 3) {
  // 验证输入
  if (!chineseText || typeof chineseText !== 'string') {
    throw new Error('中文文本不能为空');
  }

  if (chineseText.trim().length === 0) {
    throw new Error('中文文本不能为空');
  }

  // 如果 API Key 未配置，返回模拟数据（仅用于开发测试）
  if (!OPENROUTER_CONFIG.apiKey) {
    console.warn('⚠️  OpenRouter API Key 未配置，返回模拟数据');
    return [
      {
        text: `Translation of: ${chineseText}`,
        style: '模拟翻译（请配置 API Key）',
      },
    ];
  }

  try {
    const translations = await callOpenRouter(chineseText, candidateCount);
    console.log(`✅ 翻译成功，共 ${translations.length} 个候选项`);
    return translations;
  } catch (error) {
    console.error('❌ 翻译失败:', error);
    throw error;
  }
}

/**
 * 验证 OpenRouter 配置
 * @returns {Object} - 配置验证结果
 */
function validateConfig() {
  return {
    hasApiKey: !!OPENROUTER_CONFIG.apiKey,
    model: OPENROUTER_CONFIG.model,
    message: OPENROUTER_CONFIG.apiKey ? 'OpenRouter 配置正常' : '请配置环境变量 OPENROUTER_API_KEY',
  };
}

module.exports = {
  translateToEnglish,
  validateConfig,
};
