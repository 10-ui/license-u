import { create } from 'zustand';

/**
 * エディタの種類
 */
type EditorType = 'vscode' | 'cursor' | 'dreamweaver';

/**
 * 設定データの型定義
 */
interface SettingsData {
  /** ローカル環境のURL */
  LocalUrl: string;
  /** プロジェクトベースパス */
  ProjectBasePath: string;
  /** 使用エディタ */
  PreferredEditor: EditorType;
}

/**
 * 設定ストアの状態とアクションの型定義
 */
interface SettingsState {
  /** ローカル環境のURL */
  LocalUrl: string;
  /** プロジェクトベースパス */
  ProjectBasePath: string;
  /** 使用エディタ */
  PreferredEditor: EditorType;
  /** 設定の読み込み状態 */
  IsLoading: boolean;
  /** エラーメッセージ */
  ErrorMessage: string | null;

  /** ローカルURLを設定 */
  SetLocalUrl: (url: string) => void;
  /** プロジェクトベースパスを設定 */
  SetProjectBasePath: (path: string) => void;
  /** 使用エディタを設定 */
  SetPreferredEditor: (editor: EditorType) => void;
  /** Chrome Storageから設定を読み込み */
  LoadSettings: () => Promise<void>;
  /** Chrome Storageに設定を保存 */
  SaveSettings: () => Promise<void>;
  /** ローカルURLのみ保存 */
  SaveLocalUrl: () => Promise<void>;
  /** プロジェクトベースパスのみ保存 */
  SaveProjectBasePath: () => Promise<void>;
  /** 使用エディタのみ保存 */
  SavePreferredEditor: () => Promise<void>;
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
  ProjectBasePath: '',
  PreferredEditor: 'vscode',
  IsLoading: false,
  ErrorMessage: null,

  SetLocalUrl: (url: string) => {
    set({ LocalUrl: url });
  },

  SetProjectBasePath: (path: string) => {
    set({ ProjectBasePath: path });
  },

  SetPreferredEditor: (editor: EditorType) => {
    set({ PreferredEditor: editor });
  },

  LoadSettings: async () => {
    try {
      set({ IsLoading: true, ErrorMessage: null });

      const result = await chrome.storage.local.get([
        'LocalUrl',
        'ProjectBasePath',
        'PreferredEditor',
      ]);

      set({
        LocalUrl: result.LocalUrl || '',
        ProjectBasePath: result.ProjectBasePath || '',
        PreferredEditor: result.PreferredEditor || 'vscode',
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

      const { LocalUrl, ProjectBasePath, PreferredEditor } = get();
      const settingsData: SettingsData = {
        LocalUrl,
        ProjectBasePath,
        PreferredEditor,
      };

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

  SaveLocalUrl: async () => {
    try {
      set({ IsLoading: true, ErrorMessage: null });

      const { LocalUrl } = get();
      await chrome.storage.local.set({ LocalUrl });

      set({ IsLoading: false });
    } catch (CaughtError) {
      const ErrorMessage = `[SaveLocalUrl] ローカルURLの保存でエラーが発生しました: ${
        CaughtError instanceof Error ? CaughtError.message : String(CaughtError)
      }`;

      console.error(ErrorMessage, CaughtError);

      set({
        ErrorMessage: 'ローカルURLの保存に失敗しました。',
        IsLoading: false,
      });
    }
  },

  SaveProjectBasePath: async () => {
    try {
      set({ IsLoading: true, ErrorMessage: null });

      const { ProjectBasePath } = get();
      await chrome.storage.local.set({ ProjectBasePath });

      set({ IsLoading: false });
    } catch (CaughtError) {
      const ErrorMessage = `[SaveProjectBasePath] プロジェクトベースパスの保存でエラーが発生しました: ${
        CaughtError instanceof Error ? CaughtError.message : String(CaughtError)
      }`;

      console.error(ErrorMessage, CaughtError);

      set({
        ErrorMessage: 'プロジェクトベースパスの保存に失敗しました。',
        IsLoading: false,
      });
    }
  },

  SavePreferredEditor: async () => {
    try {
      set({ IsLoading: true, ErrorMessage: null });

      const { PreferredEditor } = get();
      await chrome.storage.local.set({ PreferredEditor });

      set({ IsLoading: false });
    } catch (CaughtError) {
      const ErrorMessage = `[SavePreferredEditor] 使用エディタの保存でエラーが発生しました: ${
        CaughtError instanceof Error ? CaughtError.message : String(CaughtError)
      }`;

      console.error(ErrorMessage, CaughtError);

      set({
        ErrorMessage: '使用エディタの保存に失敗しました。',
        IsLoading: false,
      });
    }
  },

  ClearError: () => {
    set({ ErrorMessage: null });
  },
}));
