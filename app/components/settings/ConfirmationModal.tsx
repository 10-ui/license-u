import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * 確認モーダルコンポーネントのProps
 */
interface ConfirmationModalProps {
  /** モーダルの表示状態 */
  IsOpen: boolean;
  /** モーダルを閉じるためのコールバック */
  OnClose: () => void;
  /** 確認ボタンクリック時のコールバック */
  OnConfirm: () => void;
  /** モーダルのタイトル */
  Title: string;
  /** モーダルの説明文 */
  Description: string;
  /** 確認ボタンのテキスト */
  ConfirmButtonText?: string;
  /** キャンセルボタンのテキスト */
  CancelButtonText?: string;
}

/**
 * 確認モーダルコンポーネント
 * 
 * @description
 * - ローカルURL未設定時の確認モーダル
 * - shadcn/ui Dialog を使用
 * - カスタマイズ可能なタイトル・説明文
 * - はい・いいえボタンでの確認処理
 * - 将来的な他の確認処理にも再利用可能
 */
export default function ConfirmationModal({
  IsOpen,
  OnClose,
  OnConfirm,
  Title,
  Description,
  ConfirmButtonText = 'はい',
  CancelButtonText = 'いいえ',
}: ConfirmationModalProps) {
  /**
   * 確認ボタンクリック時の処理
   */
  const HandleConfirm = () => {
    OnConfirm();
    OnClose();
  };

  /**
   * キャンセルボタンクリック時の処理
   */
  const HandleCancel = () => {
    OnClose();
  };

  return (
    <Dialog open={IsOpen} onOpenChange={OnClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{Title}</DialogTitle>
          <DialogDescription>{Description}</DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            variant='outline'
            onClick={HandleCancel}
          >
            {CancelButtonText}
          </Button>
          <Button
            onClick={HandleConfirm}
          >
            {ConfirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 