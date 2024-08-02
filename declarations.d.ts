declare module '@react-navigation/native-stack' {
    import { StackNavigationProp } from '@react-navigation/stack';
    import { ParamListBase } from '@react-navigation/native';
  
    export type NativeStackNavigationProp<
      ParamList extends ParamListBase,
      RouteName extends keyof ParamList = string
    > = StackNavigationProp<ParamList, RouteName>;
  
  }