// filepath: /home/zhangxiao/frontend/HamsterNote/components/src/components/icon/icon-names.ts

/**
 * Icon 名称数组 + 派生类型
 * ───────────────────────────────────────────────────────────────────────────
 * 把名称数组从 Icon.tsx 拆出来的原因：
 * `react-refresh/only-export-components` 要求一个文件要么只导出组件，要么把
 * 非组件导出拆到独立文件。Icon.tsx 同时导出 Icon 组件和 ICON_NAMES 常量会
 * 触发该规则，故把名称数组 + 类型派生放到这里。
 *
 * 设计：单一数据源。IconName 类型从 ICON_NAMES 数组派生，避免数组与联合
 * 类型之间出现漂移。新增图标只需在数组里追加一个字面量。
 */

/** 58 个图标名称字面量数组（运行时枚举与 demo 遍历用） */
export const ICON_NAMES = [
  // ── 用户明确要求（26 个） ──────────────────────────────────────────────
  'file', // 文件
  'save', // 保存
  'study', // 学习
  'switch', // 切换
  'mouse', // 鼠标
  'line', // 线段
  'curve', // 曲线段
  'polygon', // 多边形
  'lasso', // 套索
  'rectangle', // 矩形
  'ellipse', // 椭圆
  'pen', // 手写笔
  'eraser', // 橡皮
  'magnet', // 吸铁石
  'locate', // 定位
  'delete', // 删除
  'add', // 添加
  'copy', // 复制
  'paste', // 粘贴
  'info', // 信息
  'touch', // 触摸
  'edit', // 编辑
  'comment', // 评论
  'keyboard', // 键盘
  'type', // 字体
  'handle', // 6 点拖拽 handle
  'card', // 卡片
  // ── 第二批新增（3 个） ──────────────────────────────────────────────────
  'minimap', // 小地图
  'font-size', // 字号（字体大小）
  'drag', // 拖拽（手型）
  // ── 补充常用（26 个） ──────────────────────────────────────────────────
  'search', // 搜索
  'close', // 关闭
  'check', // 勾选
  'chevron-down', // 下箭头
  'chevron-up', // 上箭头
  'chevron-left', // 左箭头
  'chevron-right', // 右箭头
  'arrow-up', // 上行箭头
  'arrow-down', // 下行箭头
  'arrow-left', // 左行箭头
  'arrow-right', // 右行箭头
  'settings', // 设置
  'user', // 用户
  'home', // 首页
  'star', // 收藏
  'bookmark', // 书签
  'link', // 链接
  'image', // 图片
  'calendar', // 日历
  'clock', // 时钟
  'bell', // 通知
  'download', // 下载
  'upload', // 上传
  'share', // 分享
  'undo', // 撤销
  'redo', // 重做
  'zoom-in', // 放大
  'zoom-out', // 缩小
  'fullscreen', // 全屏展开
  'fullscreen-exit', // 退出全屏
  'menu', // 菜单
  'more', // 更多
  'filter', // 筛选
  'sort', // 排序
] as const;

/** 58 个图标的名称联合类型（从 ICON_NAMES 派生，单一数据源） */
export type IconName = (typeof ICON_NAMES)[number];
