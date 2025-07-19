import AppContainer from '@/components/AppContainer';

/**
 * ポップアップアプリケーションのメインコンポーネント
 * 
 * @description
 * - Chrome拡張機能のポップアップ画面
 * - AppContainerに全体の処理を委譲
 * - 責務が明確に分離された構造
 * 
 * @returns {JSX.Element} アプリケーション全体のJSX要素
 */
function App() {
  return (
    <main className='w-full p-4'>
      <AppContainer />
      </main>
  );
}

export default App;
