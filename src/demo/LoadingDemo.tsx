import { useState } from 'react';

import { Button, Loading, showLoading } from '../index';
import { DemoCode } from './DemoCode';

interface LoadingDemoProps {
  readonly onFeedback: (message: string) => void;
}

const inlineExampleCode = `// 三种尺寸的内联 spinner，默认 medium
<Loading size="small" />
<Loading />
<Loading size="large" />

// 带提示文案：text 渲染在 spinner 旁边
<Loading text="正在保存…" />`;

const coverExampleCode = `// 父级必须是 position: relative，cover 才能铺满父级
<div style={{ position: 'relative', minHeight: 160 }}>
  {/* ...卡片内容... */}
  <Loading cover text="加载中" />
</div>`;

const singletonExampleCode = `import { showLoading, hideLoading } from '@hamster-note/components';

// 显示全屏 loading，返回一个 hide 函数
const hide = showLoading({ text: '正在加载…' });

// 1.5s 后隐藏
setTimeout(() => hide(), 1500);

// 也可以直接调用 hideLoading()，无需持有 hide 引用
// hideLoading();`;

export function LoadingDemo({ onFeedback }: LoadingDemoProps) {
  // cover 形态演示：在相对定位的卡片内切换 loading
  const [coverShown, setCoverShown] = useState(false);

  // 触发局部覆盖 loading：1.5s 后自动收回，模拟一次异步加载
  const handleShowCover = () => {
    setCoverShown(true);
    onFeedback('已显示局部覆盖 loading');
    window.setTimeout(() => {
      setCoverShown(false);
      onFeedback('局部覆盖 loading 已结束');
    }, 1500);
  };

  // 触发全屏单例 loading：showLoading 返回 hide 函数，1.5s 后调用它清理
  const handleShowSingleton = () => {
    const hide = showLoading({ text: '正在加载…' });
    onFeedback('已显示全屏 loading（单例）');
    window.setTimeout(() => {
      hide();
      onFeedback('全屏 loading 已隐藏');
    }, 1500);
  };

  return (
    <div className="popover-grid">
      {/* 示例一：内联 spinner —— 三种尺寸 + 带文案 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Inline / 内联 spinner</span>
            <p>三种尺寸（small / medium / large）与可选 text；颜色跟随 --hn-color-accent。</p>
          </div>
        </div>
        <div className="loading-demo-row">
          <Loading size="small" />
          <Loading />
          <Loading size="large" />
          <Loading size="small" text="保存中" />
          <Loading text="正在同步笔记…" />
        </div>
        <DemoCode code={inlineExampleCode} />
      </div>

      {/* 示例二：局部覆盖 cover —— 在相对定位的卡片内遮罩 */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Cover / 局部覆盖</span>
            <p>
              cover=true 时绝对定位铺满最近 positioned 祖先（父级需 position: relative），
              带半透明遮罩 + 居中 spinner。
            </p>
          </div>
          <Button disabled={coverShown} onClick={handleShowCover} size="small">
            {coverShown ? '加载中…' : '触发'}
          </Button>
        </div>
        <div className="loading-demo-card">
          <div className="loading-demo-card__title">第三季度产品规划</div>
          <p className="loading-demo-card__excerpt">
            汇总季度目标与里程碑，供团队评审。这里是一段占位内容，用于展示 cover loading
            铺在卡片内容之上的视觉效果。
          </p>
          <div className="loading-demo-card__meta">更新于 8 分钟前 · 12 个区块</div>
          {coverShown ? <Loading cover size="medium" text="加载中" /> : null}
        </div>
        <DemoCode code={coverExampleCode} />
      </div>

      {/* 示例三：全屏单例 API —— showLoading / hideLoading */}
      <div className="popover-example">
        <div className="popover-example__header">
          <div>
            <span className="stage-label">Singleton / 全屏单例 API</span>
            <p>
              showLoading(options) 渲染全屏遮罩 + spinner，单例语义（重复调用不创建第二个）； 返回
              hide 函数，或直接调用 hideLoading()。
            </p>
          </div>
          <Button onClick={handleShowSingleton} size="small" variant="primary">
            触发全屏
          </Button>
        </div>
        <DemoCode code={singletonExampleCode} label="TSX + 说明" />
      </div>
    </div>
  );
}
