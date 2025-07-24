import React from 'react';
import Button from './Button';
import Icon from './Icon';
import { useAuthContext } from '../../contexts/AuthContext';

interface LoginButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  className = '', 
  variant = 'primary',
  size = 'md'
}) => {
  const { state, login, logout } = useAuthContext();
  const { user, isLoading } = state;

  const handleLogin = async () => {
    try {
      await login({ method: 'google' });
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={`${className}`}
      >
        <Icon name="Loader2" size={16} className="animate-spin mr-2" />
        로딩 중...
      </Button>
    );
  }

  if (user) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleLogout}
        className={`${className}`}
      >
        <Icon name="LogOut" size={16} className="mr-2" />
        로그아웃
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogin}
      className={`${className}`}
    >
      <Icon name="LogIn" size={16} className="mr-2" />
      로그인
    </Button>
  );
};

export default LoginButton; 