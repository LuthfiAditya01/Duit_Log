declare module 'react-native-color-picker-wheel' {
  import { StyleProp, ViewStyle } from 'react-native';

  interface ColorPickerWheelProps {
    initialColor?: string;
    onColorChange?: (color: string) => void;
    style?: StyleProp<ViewStyle>;
  }

  const ColorPickerWheel: React.FC<ColorPickerWheelProps>;
  export default ColorPickerWheel;
}

