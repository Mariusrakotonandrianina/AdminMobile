import React from 'react';
import { Text, TextProps } from 'react-native';

const CustomStyledText: React.FC<TextProps & { className?: string }> = ({ className, ...props }) => {
  return <Text className={className} {...props} />;
};

export default CustomStyledText;
