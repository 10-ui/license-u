import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import Header from '@/components/common/Header';
import ShobiButtons from '@/components/common/ShobiButtons';
import FileSection from '@/components/common/FileSection';
import ResultDisplay from '@/components/common/ResultDisplay';
import SettingsPage from '@/components/settings/SettingsPage';
import ConfirmationModal from '@/components/settings/ConfirmationModal';

/**
 * 画面の表示状態を管理する型
 */
type ViewState = 'main' | 'settings';

/**
 * アプリケーションコンテナコンポーネント
 *
 * @description
 * - 全体の画面遷移を管理
 * - 各コンポーネントの協調処理
 * - 設定値の初期読み込み
 * - 責務が明確に分離された構造
 *
 * @returns {JSX.Element} アプリケーション全体のJSX要素
 */
export default function AppContainer() {
  // 画面表示状態の管理
  const [currentView, setCurrentView] = useState<ViewState>('main');
  // 実行結果をリアルタイム表示するためのstate
  const [result, setResult] = useState<string>('ボタンをクリックしてください');
  // 確認モーダルの表示状態
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Zustandストアから設定値を取得
  const { LoadSettings } = useSettingsStore();

  // 初期読み込み時に設定値を取得
  useEffect(() => {
    LoadSettings();
  }, [LoadSettings]);

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
   * 結果メッセージの更新
   *
   * @param message - 表示するメッセージ
   */
  const HandleResultUpdate = (message: string) => {
    setResult(message);
  };

  /**
   * ローカル環境URL未設定時の処理
   */
  const HandleLocalUrlNotSet = () => {
    setIsConfirmationModalOpen(true);
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
    return (
      <>
        <Header
          OnSettingsClick={HandleSettingsClick}
          OnBackClick={HandleBackToMain}
          IsSettingsView={true}
        />
        <SettingsPage OnBack={HandleBackToMain} />
      </>
    );
  }

  // メイン画面を表示
  return (
    <>
      <Header
        OnSettingsClick={HandleSettingsClick}
        OnBackClick={HandleBackToMain}
        IsSettingsView={false}
      />

      <ShobiButtons
        OnResultUpdate={HandleResultUpdate}
        OnLocalUrlNotSet={HandleLocalUrlNotSet}
      />

      <FileSection OnResultUpdate={HandleResultUpdate} />

      <ResultDisplay Message={result} />

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
