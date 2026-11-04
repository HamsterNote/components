import type { SvgProps } from 'react-native-svg';
import Svg from 'react-native-svg/src/elements/Svg';
import Path from 'react-native-svg/src/elements/Path';
import Rect from 'react-native-svg/src/elements/Rect';
import Circle from 'react-native-svg/src/elements/Circle';
import Ellipse from 'react-native-svg/src/elements/Ellipse';
import Line from 'react-native-svg/src/elements/Line';
import Polyline from 'react-native-svg/src/elements/Polyline';
import { ICON_GEOMETRY, type IconShape } from '../../../src/shared/icons';
import type { IconName } from '../../../src/shared/icon-names';
import { useTheme } from './theme';
export { ICON_NAMES, type IconName } from '../../../src/shared/icon-names';
function Shape({ shape }: { shape: IconShape }) {
  switch (shape.tag) {
    case 'path':
      return <Path {...shape.attrs} />;
    case 'rect':
      return <Rect {...shape.attrs} />;
    case 'circle':
      return <Circle {...shape.attrs} />;
    case 'ellipse':
      return <Ellipse {...shape.attrs} />;
    case 'line':
      return <Line {...shape.attrs} />;
    case 'polyline':
      return <Polyline {...shape.attrs} />;
  }
}
export interface IconProps extends Omit<SvgProps, 'name'> {
  name: IconName;
  label?: string;
  size?: number;
  color?: string;
}
export function Icon({ name, label, size = 24, color, ...props }: IconProps) {
  const t = useTheme();
  return (
    <Svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? t.colors.text}
      color={color ?? t.colors.text}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={label !== undefined}
      accessibilityLabel={label}
      accessibilityRole="image"
      accessibilityElementsHidden={label === undefined}
      importantForAccessibility={label === undefined ? 'no-hide-descendants' : 'yes'}
    >
      {ICON_GEOMETRY[name].map((shape, i) => (
        <Shape shape={shape} key={i} />
      ))}
    </Svg>
  );
}
