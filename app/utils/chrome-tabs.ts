/**
 * Chrome拡張機能のタブ関連ユーティリティ
 *
 * @description
 * Chrome tabs APIを使用したタブ操作に関する共通関数を提供
 * 現在のタブのURL取得や加工処理などの機能を含む
 *
 * @author Sentaro Shinozaki
 */

/**
 * 現在のアクティブタブのURLを取得し、加工処理を行う共通関数
 *
 * @description
 * - Chrome tabs APIを使用して現在のアクティブタブのURLを取得
 * - URLを'/'でsplitし、[1]の値を抽出してコンソール出力
 * - 引数のコールバック関数で柔軟な処理を可能にする
 *
 * @param Callback - 取得したURL情報を処理するコールバック関数
 * @param ButtonType - ボタンの種類（ローカル、ND、TEST、本番）
 *
 * @throws Chrome tabs APIのアクセス権限がない場合
 * @throws アクティブタブが存在しない場合
 * @throws URLの取得・加工に失敗した場合
 */
export async function GetCurrentTabUrl(
  Callback: (
    ProcessedUrlPart: string,
    OriginalUrl: string,
    ButtonType: string
  ) => void,
  ButtonType: string
): Promise<void> {
  try {
    // Chrome tabs APIが利用可能かチェック
    if (!chrome?.tabs) {
      const ErrorMessage =
        '[GetCurrentTabUrl] Chrome tabs APIが利用できません。manifest.jsonのpermissionsを確認してください。';
      console.error(ErrorMessage);
      throw new Error(ErrorMessage);
    }

    // 現在のアクティブタブを取得
    const Tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!Tabs || Tabs.length === 0) {
      const ErrorMessage =
        '[GetCurrentTabUrl] アクティブなタブが見つかりません。';
      console.error(ErrorMessage);
      throw new Error(ErrorMessage);
    }

    const CurrentTab = Tabs[0];
    const OriginalUrl = CurrentTab.url;

    if (!OriginalUrl) {
      const ErrorMessage =
        '[GetCurrentTabUrl] タブのURLを取得できませんでした。';
      console.error(ErrorMessage, { tab: CurrentTab });
      throw new Error(ErrorMessage);
    }

    // URLを最初の'/'だけでsplitして[1]を取得（[0]と[1]の2つの要素のみ生成）
    // 例: 'https://example.com/test/page' → ['https://example.com', 'test/page']
    const SlashIndex = OriginalUrl.indexOf('/', 8); // 'https://'の後の最初の'/'を検索
    let UrlParts: string[];

    if (SlashIndex === -1) {
      // '/'が見つからない場合（例: 'https://example.com'）
      UrlParts = [OriginalUrl, ''];
    } else {
      // 最初の'/'で分割
      UrlParts = [
        OriginalUrl.substring(0, SlashIndex),
        OriginalUrl.substring(SlashIndex + 1),
      ];
    }

    const ProcessedUrlPart = UrlParts[1] || '';

    // コールバック関数を実行
    Callback(ProcessedUrlPart, OriginalUrl, ButtonType);
  } catch (CaughtError) {
    const DetailedErrorMessage = `[GetCurrentTabUrl] エラーが発生しました - ボタン種類: ${ButtonType}, エラー内容: ${
      CaughtError instanceof Error ? CaughtError.message : String(CaughtError)
    }`;
    console.error(DetailedErrorMessage, {
      ButtonType,
      CaughtError,
      Stack: CaughtError instanceof Error ? CaughtError.stack : undefined,
    });
    throw new Error(DetailedErrorMessage);
  }
}
