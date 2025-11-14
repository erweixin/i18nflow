/**
 * I18N 编辑 Modal
 * 展示和编辑翻译内容
 */

import React, { useCallback, useEffect, useState } from 'react';

import { useI18nDebug } from '../hooks/useI18nDebug';
import {
  Modal,
  Form,
  FormItem,
  TextArea,
  Button,
  message,
  Space,
  Typography,
  Spin,
  Alert,
  Tag,
  useForm,
} from './native';

const { Text } = Typography;

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
  const [form] = useForm();
  const { loading, readI18nValue, updateI18nValue, translateText, translating } = useI18nDebug();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loadingValues, setLoadingValues] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<TranslationCandidate[]>([]);
  const [chineseText, setChineseText] = useState<string>('');
  const [shouldAutoTranslate, setShouldAutoTranslate] = useState(false);

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
        // 更新中文文本状态
        setChineseText(values['zh-CN'] || '');
        // 设置自动翻译标志
        setShouldAutoTranslate(true);
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

  const handleAITranslate = async () => {
    if (!chineseText || chineseText.trim().length === 0) {
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
  };

  // 加载翻译值
  useEffect(() => {
    if (visible && i18nKey) {
      loadI18nValues();
    } else {
      // 关闭时重置状态
      setInitialValues(null);
      setLoadError(null);
      setTranslations([]);
      setChineseText('');
      setShouldAutoTranslate(false);
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, i18nKey]);

  // 自动触发 AI 翻译：仅在 loadI18nValues 完成后触发一次
  useEffect(() => {
    if (shouldAutoTranslate && chineseText && chineseText.trim()) {
      // 重置标志，确保只触发一次
      setShouldAutoTranslate(false);

      translateText(chineseText, 3)
        .then(result => {
          if (result && result.length > 0) {
            setTranslations(result);
            message.success('AI 翻译成功，请选择候选词');
          }
        })
        .catch(() => {
          // 静默失败，用户可以手动点击翻译按钮
          console.warn('自动 AI 翻译失败');
        });
    }
  }, [shouldAutoTranslate, chineseText, translateText]);

  const handleSubmit = React.useCallback(async () => {
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
  }, [i18nKey, form, updateI18nValue, onClose]);

  const handleCancel = React.useCallback(() => {
    form.resetFields();
    setInitialValues(null);
    setLoadError(null);
    onClose();
  }, [form, onClose]);

  const handleReset = React.useCallback(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      message.info('已重置为初始值');
    }
  }, [initialValues, form]);

  const handleRetry = () => {
    loadI18nValues();
  };

  const handleSelectTranslation = (text: string) => {
    form.setFieldValue('en-US', text);
    message.success('已应用翻译');
  };

  const modalTitle = React.useMemo(
    () => (
      <span>
        🌍 编辑翻译
        {i18nKey && (
          <Text type="secondary" style={{ marginLeft: 12, fontSize: 14 }}>
            {i18nKey}
          </Text>
        )}
      </span>
    ),
    [i18nKey]
  );

  const modalFooter = React.useMemo(
    () => (
      <Space>
        <Button onClick={handleReset}>重置</Button>
        <Button onClick={handleCancel}>取消</Button>
        <Button type="primary" onClick={handleSubmit} loading={loading}>
          保存并刷新
        </Button>
      </Space>
    ),
    [loading, handleReset, handleCancel, handleSubmit]
  );

  return (
    <Modal
      open={visible}
      title={modalTitle}
      onClose={handleCancel}
      footer={modalFooter}
      width={650}
    >
      <Spin spinning={loadingValues} tip="正在加载翻译内容...">
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 加载错误提示 */}
          {loadError && (
            <Alert
              type="error"
              message="加载失败"
              description={
                <Space direction="vertical" size={4}>
                  <div>{loadError}</div>
                  <Button onClick={handleRetry} icon={<span>↻</span>}>
                    重试
                  </Button>
                </Space>
              }
            />
          )}

          {/* 表单 */}
          {!loadError && (
            <Form>
              <FormItem label="中文翻译" name="zh-CN" required>
                <TextArea
                  value={form.getFieldValue('zh-CN')}
                  onChange={e => {
                    const value = e.target.value;
                    form.setFieldValue('zh-CN', value);
                    setChineseText(value);
                  }}
                  placeholder="请输入中文翻译"
                  rows={3}
                />
              </FormItem>

              <FormItem
                label={
                  <span>
                    英文翻译
                    {typeof translateText === 'function' && (
                      <Button
                        style={{ marginLeft: 12 }}
                        onClick={handleAITranslate}
                        loading={translating}
                        icon={<span>⚡</span>}
                      >
                        AI 翻译
                      </Button>
                    )}
                  </span>
                }
                name="en-US"
                required
              >
                <TextArea
                  value={form.getFieldValue('en-US')}
                  onChange={e => form.setFieldValue('en-US', e.target.value)}
                  placeholder="请输入英文翻译"
                  rows={3}
                />
              </FormItem>

              {/* AI 翻译候选词 */}
              {translations.length > 0 && (
                <div>
                  <div
                    style={{
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#262626',
                    }}
                  >
                    AI 翻译候选（点击应用）
                  </div>
                  <Space style={{ flexWrap: 'wrap' }}>
                    {translations.map((item, index) => (
                      <Tag
                        key={index}
                        onClick={() => handleSelectTranslation(item.text)}
                        icon={<span>⚡</span>}
                      >
                        {item.text}
                        {item.style && (
                          <Text type="secondary" style={{ marginLeft: 4, fontSize: 11 }}>
                            ({item.style})
                          </Text>
                        )}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}

              {/* 提示信息 */}
              {typeof translateText !== 'function' && (
                <Alert type="info" message="AI 翻译功能未配置，请在开发环境中配置 API Key" />
              )}
            </Form>
          )}
        </Space>
      </Spin>
    </Modal>
  );
};
