import React from 'react';
import { View, ViewProps } from 'react-native';


const CustomStyledView: React.FC<ViewProps & { className?: string }> = ({ className, ...props }) => {
  return <View className={className} {...props} />;
};

export default CustomStyledView;
