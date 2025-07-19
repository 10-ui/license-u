import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settingsStore';
import { GetCurrentTabUrl } from '@/utils/chrome-tabs';

/**
 * ファイルセクションコンポーネントのProps
 */
interface FileSectionProps {
  /** 結果メッセージ更新用のコールバック */
  OnResultUpdate: (message: string) => void;
}

/**
 * ファイル操作セクションコンポーネント
 *
 * @description
 * - 現在のURLからローカルファイルパスを推測
 * - 設定されたエディタで開く or パスをコピー
 * - URLマッピング: domain/path/to/page → {ProjectBasePath}/_views/path/to/page.tpl
 *
 * @returns {JSX.Element} ファイル操作ボタンのJSX要素
 */
export default function FileSection({ OnResultUpdate }: FileSectionProps) {
  // Zustandストアから設定値を取得
  const { ProjectBasePath, PreferredEditor } = useSettingsStore();

  /**
   * URLからローカルファイルパスを推測する関数
   *
   * @param url - 現在のURL
   * @returns ローカルファイルパス
   */
  const MapUrlToFilePath = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // パスの先頭の '/' を除去
      const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;

      // ベースパス + /_views/ + URL のパス部分 + .tpl
      const filePath = `${ProjectBasePath}\\_views\\${cleanPath.replace(
        /\//g,
        '\\'
      )}`;

      // .tpl 拡張子を追加（既に拡張子がある場合は置換）
      const filePathWithExt = filePath.replace(/\.[^.]*$/, '') + '.tpl';

      return filePathWithExt;
    } catch (error) {
      console.error('[MapUrlToFilePath] URL解析エラー:', error);
      return `${ProjectBasePath}\\_views\\error.tpl`;
    }
  };

  /**
   * 設定されたエディタでファイルを開く
   *
   * @param filePath - 開くファイルのパス
   */
  const OpenFileInEditor = (filePath: string): void => {
    switch (PreferredEditor) {
      case 'vscode':
        chrome.tabs.create({
          url: `vscode://file/${filePath.replace(/\\/g, '/')}`,
        });
        OnResultUpdate(`✅ VS Codeで開きました: ${filePath}`);
        break;

      case 'cursor':
        chrome.tabs.create({
          url: `cursor://file/${filePath.replace(/\\/g, '/')}`,
        });
        OnResultUpdate(`✅ Cursorで開きました: ${filePath}`);
        break;

      case 'dreamweaver':
        // Dreamweaverはカスタムプロトコルがないため、パスをコピー
        navigator.clipboard.writeText(filePath);
        OnResultUpdate(`📋 ファイルパスをコピーしました: ${filePath}`);
        break;

      default:
        OnResultUpdate(`❌ 未対応のエディタです: ${PreferredEditor}`);
        break;
    }
  };

  /**
   * URL取得後の処理を行うコールバック関数
   *
   * @param ProcessedUrlPart - URLを'/'で分割した[1]の部分（未使用）
   * @param OriginalUrl - 取得した元のURL
   * @param ButtonType - クリックされたボタンの種類（未使用）
   */
  const HandleUrlProcessing = (
    ProcessedUrlPart: string,
    OriginalUrl: string,
    ButtonType: string
  ): void => {
    const filePath = MapUrlToFilePath(OriginalUrl);
    OpenFileInEditor(filePath);
  };

  /**
   * ファイルを開くボタンクリック時の処理
   */
  const HandleOpenFileClick = async (): Promise<void> => {
    // 設定値のチェック
    if (!ProjectBasePath || ProjectBasePath.trim() === '') {
      OnResultUpdate(
        '❌ プロジェクトベースパスが設定されていません。設定画面で設定してください。'
      );
      return;
    }

    try {
      // 実行中の状態を表示
      OnResultUpdate('ファイルパス取得中...');

      await GetCurrentTabUrl(HandleUrlProcessing, 'file');
    } catch (CaughtError) {
      const ErrorMessage = `[HandleOpenFileClick] ファイルを開く処理でエラーが発生しました: ${
        CaughtError instanceof Error ? CaughtError.message : String(CaughtError)
      }`;
      console.error(ErrorMessage, CaughtError);

      // エラー結果をリアルタイム表示
      const ErrorResultMessage = `
【ファイルを開くエラー】
エラー内容: ${
        CaughtError instanceof Error ? CaughtError.message : String(CaughtError)
      }
発生時刻: ${new Date().toLocaleTimeString()}
詳細はコンソールで確認してください
      `.trim();

      OnResultUpdate(ErrorResultMessage);
    }
  };

  // エディタ名の表示用マッピング
  const getEditorDisplayName = (editor: string) => {
    switch (editor) {
      case 'vscode':
        return 'VS Code';
      case 'cursor':
        return 'Cursor';
      case 'dreamweaver':
        return 'Dreamweaver';
      default:
        return '未設定';
    }
  };

  return (
    <div className='mt-4'>
      <h3 className='text-sm font-medium mb-2'>ファイル操作</h3>
      <Button
        variant='outline'
        onClick={HandleOpenFileClick}
        disabled={!ProjectBasePath || ProjectBasePath.trim() === ''}
        className='w-full'>
        {PreferredEditor === 'dreamweaver'
          ? 'ファイルパスをコピー'
          : `ファイルを${getEditorDisplayName(PreferredEditor)}で開く`}
      </Button>
    </div>
  );
}
