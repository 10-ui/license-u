import { Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ヘッダーコンポーネントのProps
 */
interface HeaderProps {
  /** 設定アイコンクリック時のコールバック */
  OnSettingsClick: () => void;
  /** 戻るボタンクリック時のコールバック（設定画面用） */
  OnBackClick?: () => void;
  /** 現在設定画面かどうか */
  IsSettingsView?: boolean;
}

/**
 * ヘッダーコンポーネント
 *
 * @description
 * - アプリケーションのタイトル表示
 * - 設定アイコンの表示と制御
 * - 設定画面での戻るボタン表示
 * - ShobiButtonsから分離された責務
 */
export default function Header({
  OnSettingsClick,
  OnBackClick,
  IsSettingsView = false,
}: HeaderProps) {
  return (
    <div className='flex items-center justify-between mb-4'>
      <h1 className='text-lg font-semibold'>
        {IsSettingsView ? '設定' : 'shobi-u'}
      </h1>
      <Button
        variant='ghost'
        size='sm'
        onClick={IsSettingsView ? OnBackClick : OnSettingsClick}
        className='p-2'>
        {IsSettingsView ? (
          <ArrowLeft className='h-4 w-4' />
        ) : (
          <Settings className='h-4 w-4' />
        )}
      </Button>
    </div>
  );
}
