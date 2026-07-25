import { useState } from 'react';

import { Icon, ICON_NAMES, type IconName } from '../index';

interface IconDemoProps {
  // 与其他 demo 一致：交互后回写顶部 hero 的「交互输出」状态
  readonly onFeedback: (message: string) => void;
}

// 中文名映射 -- 仅 demo 展示用，组件库本身不内置（避免给生产消费者强加翻译成本）
const ICON_LABELS_ZH: Record<IconName, string> = {
  file: '文件',
  save: '保存',
  study: '学习',
  switch: '切换',
  mouse: '鼠标',
  line: '线段',
  curve: '曲线段',
  polygon: '多边形',
  lasso: '套索',
  rectangle: '矩形',
  ellipse: '椭圆',
  pen: '手写笔',
  eraser: '橡皮',
  magnet: '吸铁石',
  locate: '定位',
  delete: '删除',
  add: '添加',
  copy: '复制',
  paste: '粘贴',
  info: '信息',
  touch: '触摸',
  edit: '编辑',
  keyboard: '键盘',
  type: '字体',
  handle: '拖拽把手',
  card: '卡片',
  minimap: '小地图',
  'font-size': '字号',
  drag: '拖拽',
  search: '搜索',
  close: '关闭',
  check: '勾选',
  'chevron-down': '下箭头',
  'chevron-up': '上箭头',
  'chevron-left': '左箭头',
  'chevron-right': '右箭头',
  'arrow-up': '上行箭头',
  'arrow-down': '下行箭头',
  'arrow-left': '左行箭头',
  'arrow-right': '右行箭头',
  settings: '设置',
  user: '用户',
  home: '首页',
  star: '收藏',
  bookmark: '书签',
  link: '链接',
  image: '图片',
  calendar: '日历',
  clock: '时钟',
  bell: '通知',
  download: '下载',
  upload: '上传',
  share: '分享',
  undo: '撤销',
  redo: '重做',
  'zoom-in': '放大',
  'zoom-out': '缩小',
  menu: '菜单',
  more: '更多',
  filter: '筛选',
  sort: '排序',
};

// 尺寸示例：用 font-size 控制 Icon 的 1em 见方
const SIZE_SAMPLES: readonly {
  readonly fontSize: string;
  readonly name: IconName;
  readonly label: string;
}[] = [
  { fontSize: '16px', name: 'file', label: '16' },
  { fontSize: '20px', name: 'save', label: '20' },
  { fontSize: '24px', name: 'study', label: '24' },
  { fontSize: '32px', name: 'edit', label: '32' },
];

// 颜色示例：用 token 派生不同 color 容器，验证 currentColor 继承
const COLOR_SAMPLES: readonly {
  readonly name: IconName;
  readonly label: string;
  readonly className: string;
}[] = [
  { name: 'info', label: '默认', className: 'icon-demo-color--default' },
  { name: 'star', label: 'accent', className: 'icon-demo-color--accent' },
  { name: 'check', label: 'success', className: 'icon-demo-color--success' },
  { name: 'bell', label: 'warning', className: 'icon-demo-color--warning' },
  { name: 'delete', label: 'danger', className: 'icon-demo-color--danger' },
  { name: 'clock', label: 'muted', className: 'icon-demo-color--muted' },
];

// 图标按钮示例：button 自带 aria-label，Icon 装饰性（aria-hidden 自动）
const ICON_BUTTONS: readonly {
  readonly name: IconName;
  readonly label: string;
  readonly feedback: string;
}[] = [
  { name: 'add', label: '新建', feedback: '已执行「新建」' },
  { name: 'save', label: '保存', feedback: '已执行「保存」' },
  { name: 'delete', label: '删除', feedback: '已执行「删除」' },
  { name: 'settings', label: '设置', feedback: '已执行「设置」' },
];

export function IconDemo({ onFeedback }: IconDemoProps) {
  // 当前选中的图标 name，仅用于视觉高亮（点击 cell 后留下「选中态」痕迹）
  const [activeName, setActiveName] = useState<IconName | null>(null);

  return (
    <div className="popover-grid">
      {/* 示例一：完整图标集网格 -- 55 个 outline 图标全展示 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">All / 完整图标集</span>
            <p>55 个 outline 风格图标，点击任一格在顶部「交互输出」查看中英文名称。</p>
          </div>
        </div>
        <div className="popover-example__surface icon-demo-grid">
          {ICON_NAMES.map((name) => {
            const zh = ICON_LABELS_ZH[name];
            return (
              <button
                className={`icon-demo-cell${activeName === name ? ' is-active' : ''}`}
                key={name}
                onClick={() => {
                  setActiveName(name);
                  onFeedback(`已选中「${zh}」(${name})`);
                }}
                title={`${zh} (${name})`}
                type="button"
              >
                <Icon name={name} />
                <span className="icon-demo-cell__label">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 示例二：尺寸 -- 通过外层 font-size 控制 1em 见方 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Sizes / 尺寸</span>
            <p>Icon 默认 1em 见方，由外层 font-size 控制；下方依次为 16 / 20 / 24 / 32px。</p>
          </div>
        </div>
        <div className="popover-example__surface icon-demo-sizes">
          {SIZE_SAMPLES.map((sample) => (
            <span className="icon-demo-size" key={sample.label}>
              <span style={{ fontSize: sample.fontSize }}>
                <Icon name={sample.name} />
              </span>
              <em>{sample.label}</em>
            </span>
          ))}
        </div>
      </div>

      {/* 示例三：颜色继承 -- stroke=currentColor 自动跟随父级 color */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Colors / 颜色继承</span>
            <p>stroke=currentColor，由父级 color 控制，自动跟随主题 token。</p>
          </div>
        </div>
        <div className="popover-example__surface icon-demo-colors">
          {COLOR_SAMPLES.map((sample) => (
            <span className={`icon-demo-color ${sample.className}`} key={sample.label}>
              <Icon name={sample.name} />
              <em>{sample.label}</em>
            </span>
          ))}
        </div>
      </div>

      {/* 示例四：可访问性 + 行内嵌入 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">A11y / 行内嵌入</span>
            <p>
              图标按钮：button 自带 aria-label，Icon 装饰性（aria-hidden 自动）；行内文案：Icon 带
              label 作为 role=&quot;img&quot; 被屏幕阅读器读出。
            </p>
          </div>
        </div>
        <div className="popover-example__surface icon-demo-inline">
          <div className="icon-demo-buttons">
            {ICON_BUTTONS.map((item) => (
              <button
                aria-label={item.label}
                className="icon-demo-iconbutton"
                key={item.name}
                onClick={() => {
                  onFeedback(item.feedback);
                }}
                type="button"
              >
                <Icon name={item.name} />
              </button>
            ))}
          </div>
          <p>
            点击 <Icon label="加号" name="add" /> 新建笔记，用 <Icon label="保存图标" name="save" />{' '}
            保存；需要撤销时点 <Icon label="撤销图标" name="undo" />
            ，搜索内容用 <Icon label="搜索图标" name="search" />。
          </p>
        </div>
      </div>
    </div>
  );
}
