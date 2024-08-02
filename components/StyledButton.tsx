import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface StyledButtonProps extends TouchableOpacityProps {
  title: string;
  className?: string;
  textClassName?: string;
}

const StyledButton: React.FC<StyledButtonProps> = ({ title, className, textClassName, ...props }) => {
  return (
    <TouchableOpacity className={className} {...props}>
      <Text className={textClassName}>{title}</Text>
    </TouchableOpacity>
  );
};

export default StyledButton;
