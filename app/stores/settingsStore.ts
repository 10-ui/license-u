import { create } from 'zustand';

/**
 * 設定データの型定義
 */
interface SettingsData {
  /** ローカル環境のURL */
  LocalUrl: string;
}

/**
 * 設定ストアの状態とアクションの型定義
 */
interface SettingsState {
  /** ローカル環境のURL */
  LocalUrl: string;
  /** 設定の読み込み状態 */
  IsLoading: boolean;
  /** エラーメッセージ */
  ErrorMessage: string | null;

  /** ローカルURLを設定 */
  SetLocalUrl: (url: string) => void;
  /** Chrome Storageから設定を読み込み */
  LoadSettings: () => Promise<void>;
  /** Chrome Storageに設定を保存 */
  SaveSettings: () => Promise<void>;
  /** エラーをクリア */
  ClearError: () => void;
}

/**
 * 設定管理用のZustandストア
 *
 * @description
 * - Chrome Storage APIを使用した永続化
 * - 非同期処理のエラーハンドリング
 * - 読み込み状態の管理
 * - 将来的な設定項目追加に対応した拡張性
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  LocalUrl: '',
  IsLoading: false,
  ErrorMessage: null,

  SetLocalUrl: (url: string) => {
    set({ LocalUrl: url });
  },

  LoadSettings: async () => {
    try {
      set({ IsLoading: true, ErrorMessage: null });

      const result = await chrome.storage.local.get(['LocalUrl']);

      set({
        LocalUrl: result.LocalUrl || '',
        IsLoading: false,
      });
    } catch (CaughtError) {
      const ErrorMessage = `[LoadSettings] 設定の読み込みでエラーが発生しました: ${
        CaughtError instanceof Error ? CaughtError.message : String(CaughtError)
      }`;

      console.error(ErrorMessage, CaughtError);

      set({
        ErrorMessage:
          '設定の読み込みに失敗しました。ページを再読み込みしてください。',
        IsLoading: false,
      });
    }
  },

  SaveSettings: async () => {
    try {
      set({ IsLoading: true, ErrorMessage: null });

      const { LocalUrl } = get();
      const settingsData: SettingsData = { LocalUrl };

      await chrome.storage.local.set(settingsData);

      set({ IsLoading: false });
    } catch (CaughtError) {
      const ErrorMessage = `[SaveSettings] 設定の保存でエラーが発生しました: ${
        CaughtError instanceof Error ? CaughtError.message : String(CaughtError)
      }`;

      console.error(ErrorMessage, CaughtError);

      // エラーの種類に応じて異なるメッセージを表示
      let UserErrorMessage = '設定の保存に失敗しました。';

      if (CaughtError instanceof Error) {
        if (CaughtError.message.includes('permissions')) {
          UserErrorMessage = '権限エラー: 設定の保存権限がありません。';
        } else if (CaughtError.message.includes('quota')) {
          UserErrorMessage = 'ストレージ容量エラー: 保存領域が不足しています。';
        } else {
          UserErrorMessage = `保存エラー: ${CaughtError.message}`;
        }
      }

      set({
        ErrorMessage: UserErrorMessage,
        IsLoading: false,
      });
    }
  },

  ClearError: () => {
    set({ ErrorMessage: null });
  },
}));
