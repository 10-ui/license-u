import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSettingsStore } from '@/stores/settingsStore';
import { useEffect, useState } from 'react';

/**
 * 設定フォームのバリデーションスキーマ
 */
const SettingsFormSchema = z.object({
  LocalUrl: z
    .string()
    .min(1, 'URLを入力してください')
    .refine((value) => {
      // 基本的なURL形式チェック（.localhost で終わることを確認）
      return value.endsWith('.localhost') || value === 'localhost';
    }, 'URL形式が正しくありません（例：testsite.localhost）'),
});

type SettingsFormValues = z.infer<typeof SettingsFormSchema>;

/**
 * 設定ページコンポーネントのProps
 */
interface SettingsPageProps {
  /** 元の画面に戻るためのコールバック */
  OnBack: () => void;
}

/**
 * 設定ページコンポーネント
 * 
 * @description
 * - ローカル環境URLの設定フォーム
 * - Zod + React Hook Form による バリデーション
 * - Zustand ストアとの連携
 * - 保存成功・失敗時のエラーメッセージ表示
 * - 将来的な設定項目追加に対応した拡張性
 */
export default function SettingsPage({ OnBack }: SettingsPageProps) {
  const {
    LocalUrl,
    IsLoading,
    ErrorMessage,
    SetLocalUrl,
    LoadSettings,
    SaveSettings,
    ClearError,
  } = useSettingsStore();

  // 成功メッセージ用のstate
  const [successMessage, setSuccessMessage] = useState<string>('');

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      LocalUrl: '',
    },
  });

  // 設定値の初期読み込み
  useEffect(() => {
    LoadSettings();
  }, [LoadSettings]);

  // ストアの値がフォームに反映されるように同期
  useEffect(() => {
    form.setValue('LocalUrl', LocalUrl);
  }, [LocalUrl, form]);

  // エラーメッセージクリア
  useEffect(() => {
    if (ErrorMessage) {
      const timer = setTimeout(() => {
        ClearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [ErrorMessage, ClearError]);

  /**
   * フォーム送信時の処理
   * 
   * @param values - フォームの値
   */
  const OnSubmit = async (values: SettingsFormValues) => {
    try {
      // 既存のメッセージをクリア
      setSuccessMessage('');
      form.clearErrors('LocalUrl');
      
      // ストアの値を更新
      SetLocalUrl(values.LocalUrl);
      
      // Chrome Storageに保存
      await SaveSettings();
      
      // 保存成功時のメッセージ表示（緑色で表示）
      setSuccessMessage('✅ 設定を保存しました');
      
      // 成功メッセージを少し遅れてクリア
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (CaughtError) {
      console.error('[OnSubmit] フォーム送信エラー:', CaughtError);
      
      // 成功メッセージをクリア
      setSuccessMessage('');
      
      // エラーメッセージをフォームに表示
      form.setError('LocalUrl', {
        type: 'manual',
        message: ErrorMessage || '設定の保存に失敗しました',
      });
    }
  };

  return (
    <div className='w-full max-w-md mx-auto p-4'>
      {/* ヘッダー */}
      <div className='flex items-center mb-6'>
        <Button
          variant='ghost'
          size='sm'
          onClick={OnBack}
          className='mr-2 p-2'
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h1 className='text-lg font-semibold'>設定</h1>
      </div>

      {/* 環境設定セクション */}
      <div className='space-y-6'>
        <div>
          <h2 className='text-base font-medium mb-4'>環境設定</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(OnSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='LocalUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ローカル環境URL</FormLabel>
                    <FormControl>
                      <div className='flex space-x-2'>
                        <Input
                          placeholder='2021-u.localhost'
                          {...field}
                          disabled={IsLoading}
                        />
                        <Button 
                          type='submit' 
                          disabled={IsLoading}
                          className='shrink-0'
                        >
                          {IsLoading ? '保存中...' : '保存'}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      ローカル開発環境のURLを入力してください
                    </FormDescription>
                    <FormMessage />
                    {/* 成功メッセージ表示エリア */}
                    {successMessage && (
                      <p className='text-sm text-green-600 font-medium'>
                        {successMessage}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* 将来的な設定項目追加用のスペース */}
        <div className='pt-4 border-t border-gray-200'>
          <p className='text-sm text-gray-500'>
            今後、ファイル設定など追加の機能が利用できるようになります。
          </p>
        </div>
      </div>
    </div>
  );
} 