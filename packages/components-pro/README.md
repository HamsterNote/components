# @hamster-note/components-pro

HamsterNote 面向产品协作场景的 React 19 复合组件库。组件直接组合
`@hamster-note/components` 的基础能力，并共享相同的设计 token。

```bash
npm install @hamster-note/components@beta @hamster-note/components-pro@beta
```

```tsx
import { CommentDrawer } from '@hamster-note/components-pro/comment-drawer';
import '@hamster-note/components/styles.css';
import '@hamster-note/components-pro/styles.css';
```

`CommentDrawer` 使用基础库的 `Drawer` 作为唯一模态容器，通过公开的 `CommentData` 与
`CommentReplyData` 类型接收 `data`，支持展示评论与单层扁平回复线程、提交非空评论或回复，并通过
`onCommentAdd` 和 `onReplyAdd` 将新增内容交给业务层持久化。`onReplyAdd` 的第三个参数是
完整的 `CommentReplyData`；回复楼中楼时，其可选 `replyTo` 会记录目标回复，根 `commentId` 保持不变。
持久化该对象并回写 `data` 后，组件会按稳定 ID 协调本地乐观回复。
