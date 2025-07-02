import { Button } from '@/components/ui/button';
import { GetCurrentTabUrl } from '@/utils/chrome-tabs';
import { useState } from 'react';

/**
 * Shobiシステム用ボタンコンポーネント
 *
 * @description
 * - 各環境（ローカル、ND、TEST、本番）へのアクセス用ボタンを提供
 * - 現在のタブのURLを取得し、環境別の処理を実行
 * - 共通のURL取得関数を使用してコードの重複を避ける
 * - 実行結果をリアルタイムで画面に表示
 *
 * @returns {JSX.Element} ボタングループのJSX要素
 */
export default function ShobiButtons() {
  // 実行結果をリアルタイム表示するためのstate
  const [result, setResult] = useState<string>('ボタンをクリックしてください');

  /**
   * URL取得後の共通処理を行うコールバック関数
   *
   * @param ProcessedUrlPart - URLを'/'で分割した[1]の部分
   * @param OriginalUrl - 取得した元のURL
   * @param ButtonType - クリックされたボタンの種類
   */
  const HandleUrlProcessing = (
    ProcessedUrlPart: string,
    OriginalUrl: string,
    ButtonType: string
  ): void => {
    // 環境別のベースURLを設定
    let BaseUrl = '';
    switch (ButtonType) {
      case 'ND':
        BaseUrl = 'nd.www.shobi-u.licenseacademy.jp/';
        break;
      case 'TEST':
        BaseUrl = 'test.shobi-u.ac.jp/';
        break;
      case '本番':
        BaseUrl = 'www.shobi-u.ac.jp/';
        break;
      case 'ローカル':
        BaseUrl = 'localhost/'; // ローカル用（念のため）
        break;
      default:
        BaseUrl = 'unknown/';
        break;
    }

    // 最終的な表示URL（プロトコル付き）
    const DisplayUrl = BaseUrl + ProcessedUrlPart;
    // NDの場合はHTTP、その他はHTTPSを使用
    const Protocol = ButtonType === 'ND' ? 'http' : 'https';
    const FullUrl = `${Protocol}://${DisplayUrl}`;

    // 新しいタブでURLを開く + クリップボードにコピー
    try {
      // 新しいタブで開く
      chrome.tabs.create({ url: FullUrl });

      // クリップボードにコピー
      navigator.clipboard.writeText(FullUrl);

      setResult(
        `✅ 新しいタブで開きました & クリップボードにコピー: ${Protocol}://${DisplayUrl}`
      );
    } catch (CaughtError) {
      console.error(
        '[HandleUrlProcessing] タブを開く・クリップボードコピー際にエラーが発生しました:',
        CaughtError
      );
      setResult(`❌ 処理に失敗しました: ${Protocol}://${DisplayUrl}`);
    }
  };

  /**
   * ボタンクリック時の共通ハンドラー
   *
   * @param ButtonType - クリックされたボタンの種類
   */
  const HandleButtonClick = async (ButtonType: string): Promise<void> => {
    try {
      // 実行中の状態を表示
      setResult('URL取得中...');

      await GetCurrentTabUrl(HandleUrlProcessing, ButtonType);
    } catch (CaughtError) {
      const ErrorMessage = `[HandleButtonClick] ${ButtonType}ボタンの処理でエラーが発生しました: ${
        CaughtError instanceof Error ? CaughtError.message : String(CaughtError)
      }`;
      console.error(ErrorMessage, { ButtonType, CaughtError });

      // エラー結果をリアルタイム表示
      const ErrorResultMessage = `
【${ButtonType}ボタンエラー】
エラー内容: ${
        CaughtError instanceof Error ? CaughtError.message : String(CaughtError)
      }
発生時刻: ${new Date().toLocaleTimeString()}
詳細はコンソールで確認してください
      `.trim();

      setResult(ErrorResultMessage);

      // TODO: 本番実装時は、ユーザーに分かりやすいエラー表示を追加
      alert(
        `エラーが発生しました: ${ButtonType}ボタンの処理に失敗しました。コンソールで詳細を確認してください。`
      );
    }
  };

  return (
    <>
      <div className='grid grid-cols-2 gap-2 mt-2'>
        <Button
          variant='outline'
          disabled
          onClick={() => HandleButtonClick('ローカル')}>
          ローカル
        </Button>
        <Button variant='outline' onClick={() => HandleButtonClick('ND')}>
          ND
        </Button>
        <Button variant='outline' onClick={() => HandleButtonClick('TEST')}>
          TEST
        </Button>
        <Button variant='outline' onClick={() => HandleButtonClick('本番')}>
          本番
        </Button>
      </div>
      <div className='mt-4 p-3 bg-gray-50 border rounded-md'>
        <pre className='text-xs whitespace-pre-wrap font-mono text-gray-700'>
          {result}
        </pre>
      </div>
    </>
  );
}
