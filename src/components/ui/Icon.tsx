import React from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Camera, 
  Image, 
  FileText, 
  Save, 
  X, 
  ChevronRight,
  ChevronLeft,
  Home,
  Settings,
  User,
  Heart,
  Star,
  Share,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Folder,
  Bookmark,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  CheckCircle,
  Copy,
  Loader,
  Loader2,
  LogOut,
  LogIn,
  Cloud,
  Smartphone,
  Shield,
  RefreshCw,
  Wifi,
  WifiOff,
  Pause
} from 'lucide-react';

// 아이콘 매핑 객체
const iconMap = {
  Search,
  Plus,
  Edit,
  Trash2,
  Camera,
  Image,
  FileText,
  Save,
  X,
  ChevronRight,
  ChevronLeft,
  Home,
  Settings,
  User,
  Heart,
  Star,
  Share,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Folder,
  Bookmark,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  CheckCircle,
  Copy,
  Loader,
  Loader2,
  LogOut,
  LogIn,
  Cloud,
  Smartphone,
  Shield,
  RefreshCw,
  Wifi,
  WifiOff,
  Pause
};

export type IconName = keyof typeof iconMap;

export interface IconProps {
  /** 아이콘 이름 */
  name: IconName;
  /** 아이콘 크기 */
  size?: number;
  /** 아이콘 색상 */
  color?: string;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 추가 클래스명 */
  className?: string;
  /** 스트로크 두께 */
  strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  onClick,
  className = '',
  strokeWidth = 2,
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const iconClasses = onClick ? 'cursor-pointer' : '';
  const classes = `${iconClasses} ${className}`;

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={classes}
      onClick={onClick}
    />
  );
};

export default Icon; 