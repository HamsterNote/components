import { Button } from '../index';

interface ButtonDemoProps {
  readonly onFeedback: (message: string) => void;
}

export function ButtonDemo({ onFeedback }: ButtonDemoProps) {
  return (
    <>
      <div className="stage-group">
        <span className="stage-label">Variants</span>
        <div className="component-row">
          <Button
            onClick={() => {
              onFeedback('Primary：已创建一条新笔记');
            }}
            variant="primary"
          >
            Primary
          </Button>
          <Button
            onClick={() => {
              onFeedback('Danger：已执行危险操作');
            }}
            variant="danger"
          >
            Danger
          </Button>
          <Button
            onClick={() => {
              onFeedback('Warning：已确认警告');
            }}
            variant="warning"
          >
            Warning
          </Button>
          <Button
            onClick={() => {
              onFeedback('Success：操作已成功');
            }}
            variant="success"
          >
            Success
          </Button>
          <Button
            onClick={() => {
              onFeedback('Info：已查看提示信息');
            }}
            variant="info"
          >
            Info
          </Button>
          <Button
            onClick={() => {
              onFeedback('Secondary：已打开导入流程');
            }}
          >
            Secondary
          </Button>
          <Button
            ghost
            onClick={() => {
              onFeedback('Ghost：已取消当前操作');
            }}
          >
            Ghost
          </Button>
          <Button ghost variant="primary">
            Primary Ghost
          </Button>
          <Button ghost variant="danger">
            Danger Ghost
          </Button>
          <Button ghost variant="warning">
            Warning Ghost
          </Button>
          <Button ghost variant="success">
            Success Ghost
          </Button>
          <Button ghost variant="info">
            Info Ghost
          </Button>
          <Button disabled>不可用</Button>
        </div>
      </div>
      <div className="stage-group">
        <span className="stage-label">Sizes</span>
        <div className="component-row component-row--aligned">
          <Button size="small">小尺寸</Button>
          <Button>默认尺寸</Button>
          <Button size="large">大尺寸</Button>
        </div>
      </div>
    </>
  );
}
