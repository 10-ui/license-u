import { Button } from '@/components/ui/button';
import { GetCurrentTabUrl } from '@/utils/chrome-tabs';
import { useState, useEffect } from 'react';
import { Settings, ArrowLeft } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import SettingsPage from '@/components/settings/SettingsPage';
import ConfirmationModal from '@/components/settings/ConfirmationModal';

/**
 * 画面の表示状態を管理する型
 */
type ViewState = 'main' | 'settings';

/**
 * Shobiシステム用ボタンコンポーネント
 *
 * @description
 * - 各環境（ローカル、ND、TEST、本番）へのアクセス用ボタンを提供
 * - 現在のタブのURLを取得し、環境別の処理を実行
 * - ローカル環境URLの設定機能（ローカルストレージ連携）
 * - 設定画面への遷移とモーダル確認機能
 * - 実行結果をリアルタイムで画面に表示
 *
 * @returns {JSX.Element} ボタングループまたは設定画面のJSX要素
 */
export default function ShobiButtons() {
  // 画面表示状態の管理
  const [currentView, setCurrentView] = useState<ViewState>('main');
  // 実行結果をリアルタイム表示するためのstate
  const [result, setResult] = useState<string>('ボタンをクリックしてください');
  // 確認モーダルの表示状態
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Zustandストアから設定値を取得
  const { LocalUrl, LoadSettings } = useSettingsStore();

  // 初期読み込み時に設定値を取得
  useEffect(() => {
    LoadSettings();
  }, [LoadSettings]);

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
        // ローカルストレージから取得したURLを使用
        BaseUrl = LocalUrl ? `${LocalUrl}/` : 'localhost/';
        break;
      default:
        BaseUrl = 'unknown/';
        break;
    }

    // 末尾スラッシュの正規化
    const NormalizedBaseUrl = BaseUrl.endsWith('/') ? BaseUrl : `${BaseUrl}/`;

    // 最終的な表示URL（プロトコル付き）
    const DisplayUrl = NormalizedBaseUrl + ProcessedUrlPart;
    // NDの場合はHTTP、その他はHTTPSを使用（ローカルはHTTP）
    const Protocol =
      ButtonType === 'ND' || ButtonType === 'ローカル' ? 'http' : 'https';
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
   * ローカルボタンクリック時の特別な処理
   */
  const HandleLocalButtonClick = async (): Promise<void> => {
    // ローカルURLが設定されているかチェック
    if (!LocalUrl || LocalUrl.trim() === '') {
      // 未設定の場合、確認モーダルを表示
      setIsConfirmationModalOpen(true);
      return;
    }

    // 設定済みの場合、通常の処理を実行
    await HandleButtonClick('ローカル');
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

  /**
   * 設定ページへの遷移
   */
  const HandleSettingsClick = () => {
    setCurrentView('settings');
  };

  /**
   * メイン画面に戻る
   */
  const HandleBackToMain = () => {
    setCurrentView('main');
  };

  /**
   * 確認モーダルで「はい」をクリックした時の処理
   */
  const HandleConfirmLocalSetup = () => {
    setCurrentView('settings');
  };

  /**
   * 確認モーダルを閉じる
   */
  const HandleCloseConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  // 設定画面を表示
  if (currentView === 'settings') {
    return <SettingsPage OnBack={HandleBackToMain} />;
  }

  // メイン画面を表示
  return (
    <>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-lg font-semibold'>shobi-u</h1>
        <Button
          variant='ghost'
          size='sm'
          onClick={HandleSettingsClick}
          className='p-2'>
          <Settings className='h-4 w-4' />
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-2 mt-2'>
        <Button variant='outline' onClick={HandleLocalButtonClick}>
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

      {/* 確認モーダル */}
      <ConfirmationModal
        IsOpen={isConfirmationModalOpen}
        OnClose={HandleCloseConfirmationModal}
        OnConfirm={HandleConfirmLocalSetup}
        Title='ローカル環境URL未設定'
        Description='ローカル環境のURLが設定されていません。設定画面に移動して設定しますか？'
        ConfirmButtonText='設定画面へ'
        CancelButtonText='キャンセル'
      />
    </>
  );
}
