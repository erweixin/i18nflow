/**
 * @i18nflow/ui-react
 * React UI components for i18nflow (Zero Dependencies!)
 */

export { I18nDebugProvider } from './components/I18nDebugProvider';
export { I18nEditModal } from './components/I18nEditModal';
export { useI18nDebug } from './hooks/useI18nDebug';

// 导出原生UI组件，供用户自定义使用
export {
  Modal,
  Button,
  Form,
  FormItem,
  Input,
  TextArea,
  useForm,
  Alert,
  Spin,
  Space,
  Tag,
  Typography,
  Tooltip,
  message,
} from './components/native';
