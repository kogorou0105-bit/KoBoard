import { AIGeneratedItem } from '@koboard/editor';

// 预设一个标准的“登录流程”作为测试用例
const mockData: AIGeneratedItem[] = [
  { type: 'node', id: 'n1', label: '用户打开页面' },
  { type: 'node', id: 'n2', label: '检查本地 Token' },
  { type: 'edge', id: 'e1', source: 'n1', target: 'n2' },
  { type: 'node', id: 'n3', label: '进入主页' },
  { type: 'edge', id: 'e2', source: 'n2', target: 'n3', label: 'Token有效' },
  { type: 'node', id: 'n4', label: '跳转登录页' },
  { type: 'edge', id: 'e3', source: 'n2', target: 'n4', label: 'Token无效' },
];

export async function mockGenerateDiagramStream(
  prompt: string, 
  onItemParsed: (item: AIGeneratedItem) => void,
  onComplete: () => void
) {
  console.log('AI 开始思考关于:', prompt);
  
  let index = 0;
  // 模拟每 300ms 吐出一个节点或连线（模拟流式打字机效果）
  const timer = setInterval(() => {
    if (index < mockData.length) {
      onItemParsed(mockData[index]);
      index++;
    } else {
      clearInterval(timer);
      onComplete();
    }
  }, 300);
}
