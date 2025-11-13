/**
 * I18N 编辑 Modal
 * 展示和编辑翻译内容
 */

import { ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  Spin,
  Alert,
  Tag,
  Tooltip,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

import { useI18nDebug } from '../hooks/useI18nDebug';

const { Text } = Typography;
const { TextArea } = Input;

interface I18nEditModalProps {
  visible: boolean;
  i18nKey: string | null;
  onClose: () => void;
}

interface TranslationCandidate {
  text: string;
  style: string;
}

export const I18nEditModal: React.FC<I18nEditModalProps> = ({ visible, i18nKey, onClose }) => {
  const [form] = Form.useForm();
  const { loading, readI18nValue, updateI18nValue, translateText, translating } = useI18nDebug();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loadingValues, setLoadingValues] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<TranslationCandidate[]>([]);

  const loadI18nValues = useCallback(async () => {
    if (!i18nKey) return;

    setLoadingValues(true);
    setLoadError(null);

    try {
      console.log('📖 开始读取翻译:', i18nKey);
      const values = await readI18nValue(i18nKey);

      if (values) {
        console.log('✅ 读取成功:', values);
        setInitialValues(values);
        form.setFieldsValue(values);
      } else {
        console.warn('⚠️ 未能读取翻译内容');
        setLoadError('未能读取翻译内容，可能该 key 不存在或格式错误');
      }
    } catch (err) {
      console.error('❌ 读取翻译失败:', err);
      setLoadError(err instanceof Error ? err.message : '读取失败');
    } finally {
      setLoadingValues(false);
    }
  }, [i18nKey, readI18nValue, form]);

  const handleAITranslate = useCallback(async () => {
    const chineseText = form.getFieldValue('zh-CN') as string;

    if (!chineseText || typeof chineseText !== 'string' || chineseText.trim().length === 0) {
      message.warning('请先输入中文内容');
      return;
    }

    try {
      const result = await translateText(chineseText, 3);

      if (result && result.length > 0) {
        setTranslations(result);
        message.success('AI 翻译成功，请选择候选词');
      } else {
        message.error('翻译失败，请稍后重试');
      }
    } catch {
      message.error('翻译失败，请检查网络或 API 配置');
    }
  }, [form, translateText]);

  // 当 modal 打开且有 key 时，读取翻译内容并自动触发 AI 翻译
  useEffect(() => {
    if (visible && i18nKey) {
      loadI18nValues().then(() => {
        // 加载完成后，自动触发 AI 翻译
        const chineseText = form.getFieldValue('zh-CN') as string;
        if (chineseText && typeof chineseText === 'string' && chineseText.trim()) {
          // 使用 setTimeout 避免阻塞 UI
          setTimeout(() => {
            handleAITranslate();
          }, 500);
        }
      });
    } else {
      // 关闭时重置状态
      setInitialValues(null);
      setLoadError(null);
      setTranslations([]);
      form.resetFields();
    }
  }, [visible, i18nKey, loadI18nValues, form, handleAITranslate]);

  const handleSubmit = async () => {
    if (!i18nKey) return;

    try {
      const values = await form.validateFields();
      const success = await updateI18nValue(i18nKey, values);

      if (success) {
        message.success('翻译已更新，页面将在 1 秒后刷新');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        onClose();
      } else {
        message.error('更新失败，请查看控制台');
      }
    } catch (err) {
      console.error('表单验证失败:', err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setInitialValues(null);
    setLoadError(null);
    onClose();
  };

  const handleReset = () => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      message.info('已重置为初始值');
    }
  };

  const handleRetry = () => {
    loadI18nValues();
  };

  const handleSelectTranslation = (text: string) => {
    form.setFieldValue('en-US', text);
    message.success('已应用翻译');
  };

  return (
    <Modal
      title="🌍 编辑翻译"
      open={visible}
      onCancel={handleCancel}
      width={650}
      centered
      footer={
        <Space>
          <Button onClick={handleReset}>重置</Button>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            保存并刷新
          </Button>
        </Space>
      }
      styles={{
        body: { padding: '16px 24px' },
      }}
    >
      <Spin spinning={loadingValues} tip="正在加载翻译内容...">
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {/* 加载错误提示 */}
          {loadError && (
            <Alert
              message="加载失败"
              description={
                <Space direction="vertical" size={4}>
                  <div>{loadError}</div>
                  <Button size="small" icon={<ReloadOutlined />} onClick={handleRetry}>
                    重试
                  </Button>
                </Space>
              }
              type="warning"
              showIcon
              closable
              onClose={() => setLoadError(null)}
            />
          )}

          {/* 提示：首次加载 */}
          {!loadingValues && !loadError && !initialValues && (
            <Alert message="正在获取当前翻译内容..." type="info" showIcon />
          )}

          {/* 编辑表单 */}
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            disabled={loadingValues}
            style={{ marginTop: 8 }}
          >
            <Form.Item
              label={
                <Space size={4}>
                  <span>🇨🇳 中文</span>
                </Space>
              }
              name="zh-CN"
              rules={[{ required: true, message: '请输入中文翻译' }]}
              style={{ marginBottom: 12 }}
            >
              <TextArea
                rows={2}
                placeholder="请输入中文翻译..."
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>

            <Form.Item
              label={
                <Space size={8}>
                  <span>🇺🇸 英文</span>
                  <Tooltip title="AI 自动翻译">
                    <Button
                      size="small"
                      type="text"
                      icon={<ThunderboltOutlined />}
                      onClick={handleAITranslate}
                      loading={translating}
                      disabled={loadingValues}
                      style={{ padding: '0 4px', height: 20 }}
                    />
                  </Tooltip>
                </Space>
              }
              name="en-US"
              rules={[{ required: true, message: '请输入英文翻译' }]}
              style={{ marginBottom: 8 }}
            >
              <TextArea
                rows={2}
                placeholder="Please enter English translation..."
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>

            {/* AI 翻译候选词 */}
            {translations.length > 0 && (
              <div
                style={{
                  padding: '8px',
                  background: '#f0f5ff',
                  border: '1px solid #adc6ff',
                  borderRadius: 4,
                  marginBottom: 8,
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size={6}>
                  <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Text strong style={{ fontSize: 12, color: '#1890ff' }}>
                      🤖 候选词（点击应用）
                    </Text>
                    <Button
                      size="small"
                      type="text"
                      onClick={() => setTranslations([])}
                      style={{ padding: '0 4px', height: 20, fontSize: 12 }}
                    >
                      清除
                    </Button>
                  </Space>
                  <Space direction="vertical" style={{ width: '100%' }} size={6}>
                    {translations.map(item => (
                      <div
                        key={`${item.style}-${item.text.substring(0, 20)}`}
                        style={{
                          padding: '6px 8px',
                          background: '#fff',
                          border: '1px solid #d9d9d9',
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onClick={() => handleSelectTranslation(item.text)}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#1890ff';
                          e.currentTarget.style.boxShadow = '0 1px 4px rgba(24, 144, 255, 0.2)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#d9d9d9';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <Space
                          style={{
                            width: '100%',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text style={{ flex: 1, fontSize: 13 }}>{item.text}</Text>
                          <Tag
                            color="blue"
                            style={{
                              margin: 0,
                              fontSize: 11,
                              padding: '0 6px',
                            }}
                          >
                            {item.style}
                          </Tag>
                        </Space>
                      </div>
                    ))}
                  </Space>
                </Space>
              </div>
            )}
          </Form>

          {/* 提示信息 */}
          <Alert
            message={
              <Text style={{ fontSize: 12 }}>
                💡 保存后将自动写入源文件并刷新页面，支持占位符如 {'{val1}'}
              </Text>
            }
            type="info"
            showIcon={false}
            style={{ padding: '4px 12px' }}
          />
        </Space>
      </Spin>
    </Modal>
  );
};
