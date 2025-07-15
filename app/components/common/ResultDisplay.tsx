/**
 * 結果表示コンポーネントのProps
 */
interface ResultDisplayProps {
  /** 表示するメッセージ */
  Message: string;
}

/**
 * 結果表示コンポーネント
 *
 * @description
 * - URL処理結果の表示
 * - エラーメッセージの表示
 * - ShobiButtonsから分離された責務
 * - 実行結果をリアルタイム表示
 */
export default function ResultDisplay({ Message }: ResultDisplayProps) {
  return (
    <div className='mt-4 p-3 bg-gray-50 border rounded-md'>
      <pre className='text-xs whitespace-pre-wrap font-mono text-gray-700'>
        {Message}
      </pre>
    </div>
  );
}
