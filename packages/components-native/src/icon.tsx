import type { SvgProps } from 'react-native-svg';
import { Platform } from 'react-native';
import { Svg, Path, Rect, Circle, Ellipse, Line, Polyline } from './svg-elements';
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
      {...(Platform.OS === 'web'
        ? {
            role: label === undefined ? undefined : ('img' as const),
            'aria-label': label,
            'aria-hidden': label === undefined,
          }
        : {
            accessible: label !== undefined,
            accessibilityLabel: label,
            accessibilityRole: 'image' as const,
            accessibilityElementsHidden: label === undefined,
            importantForAccessibility:
              label === undefined ? ('no-hide-descendants' as const) : ('yes' as const),
          })}
    >
      {ICON_GEOMETRY[name].map((shape, i) => (
        <Shape shape={shape} key={i} />
      ))}
    </Svg>
  );
}
