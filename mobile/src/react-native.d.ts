/* Ambient type declarations for React Native and Navigation */

declare module 'react-native' {
  export interface TextInput {
    focus(): void;
    blur(): void;
    clear(): void;
    isFocused(): boolean;
  }
  export const TextInput: any;
  export const View: any;
  export const Text: any;
  export const TouchableOpacity: any;
  export const StyleSheet: any;
  export const SafeAreaView: any;
  export const ScrollView: any;
  export const KeyboardAvoidingView: any;
  export const Platform: any;
  export const Alert: any;
  export const Modal: any;
  export const ActivityIndicator: any;
  export const FlatList: any;
  export const Image: any;
  export const StatusBar: any;
  export const Dimensions: any;
  export const RefreshControl: any;
  export const Animated: any;
  export const Easing: any;
  export const Vibration: any;
  export const Linking: any;
  export const Share: any;
  export type ViewStyle = any;
  export type TextStyle = any;
  export type ImageStyle = any;
  export type StyleSheetNamedStyles<T> = any;
  const ReactNative: any;
  export default ReactNative;
}

declare module '@react-navigation/native' {
  export type NavigationProp<T = any> = any;
  export type RouteProp<T = any> = any;
  export const NavigationContainer: any;
  export const useNavigation: any;
  export const useRoute: any;
  export const useIsFocused: any;
  export const createNavigationContainerRef: any;
  const Navigation: any;
  export default Navigation;
}

declare module '@react-navigation/native-stack' {
  export type NativeStackNavigationProp<T = any> = any;
  export const createNativeStackNavigator: any;
  const NativeStack: any;
  export default NativeStack;
}

declare module '@react-navigation/bottom-tabs' {
  export type BottomTabNavigationProp<T = any> = any;
  export const createBottomTabNavigator: any;
  const BottomTabs: any;
  export default BottomTabs;
}

declare module 'react-native-safe-area-context' {
  export const SafeAreaProvider: any;
  export const SafeAreaView: any;
  export const useSafeAreaInsets: any;
  const SafeAreaContext: any;
  export default SafeAreaContext;
}

declare module 'react-native-screens' {
  export const enableScreens: any;
  export const ScreenContainer: any;
  export const Screen: any;
  const RNScreens: any;
  export default RNScreens;
}
