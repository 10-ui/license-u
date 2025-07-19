import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
 * 環境設定のスキーマ定義
 */
const EnvironmentFormSchema = z.object({
  Environment: z.string().min(1, '環境を選択してください'),
});

/**
 * プロジェクトベースパス設定のスキーマ定義
 */
const ProjectBasePathFormSchema = z.object({
  ProjectBasePath: z
    .string()
    .min(1, 'プロジェクトベースパスを入力してください')
    .refine(
      (value) => value.endsWith('_app'),
      'プロジェクトベースパスは「_app」で終わる必要があります'
    ),
});

/**
 * エディタ設定のスキーマ定義
 */
const PreferredEditorFormSchema = z.object({
  PreferredEditor: z.enum(['vscode', 'cursor', 'dreamweaver'], {
    required_error: 'エディタを選択してください',
  }),
});

/**
 * 設定フォームの型定義
 */
type EnvironmentFormValues = z.infer<typeof EnvironmentFormSchema>;
type ProjectBasePathFormValues = z.infer<typeof ProjectBasePathFormSchema>;
type PreferredEditorFormValues = z.infer<typeof PreferredEditorFormSchema>;

/**
 * 設定ページコンポーネント
 * 環境設定、プロジェクトベースパス設定、エディタ設定を管理する画面
 *
 * @description
 * - 個別フォーム保存機能
 * - プロジェクトベースパス入力支援UI
 * - _appで終わるパスのバリデーション
 * - 各設定項目の独立した管理
 */
export default function SettingsPage() {
  const {
    Environment,
    ProjectBasePath,
    PreferredEditor,
    IsLoading,
    SetEnvironment,
    SetProjectBasePath,
    SetPreferredEditor,
    SaveEnvironment,
    SaveProjectBasePath,
    SavePreferredEditor,
    LoadSettings,
  } = useSettingsStore();

  // 成功メッセージ用のstate
  const [environmentSuccessMessage, setEnvironmentSuccessMessage] =
    useState<string>('');
  const [projectBasePathSuccessMessage, setProjectBasePathSuccessMessage] =
    useState<string>('');
  const [preferredEditorSuccessMessage, setPreferredEditorSuccessMessage] =
    useState<string>('');

  // 入力支援用のstate
  const [showPathHints, setShowPathHints] = useState<boolean>(false);

  // 個別フォームのセットアップ
  const environmentForm = useForm<EnvironmentFormValues>({
    resolver: zodResolver(EnvironmentFormSchema),
    defaultValues: {
      Environment: '',
    },
  });

  const projectBasePathForm = useForm<ProjectBasePathFormValues>({
    resolver: zodResolver(ProjectBasePathFormSchema),
    defaultValues: {
      ProjectBasePath: '',
    },
  });

  const preferredEditorForm = useForm<PreferredEditorFormValues>({
    resolver: zodResolver(PreferredEditorFormSchema),
    defaultValues: {
      PreferredEditor: 'vscode',
    },
  });

  // 設定値の初期読み込み
  useEffect(() => {
    LoadSettings();
  }, [LoadSettings]);

  // ストアの値がフォームに反映されるように同期
  useEffect(() => {
    environmentForm.setValue('Environment', Environment);
  }, [Environment, environmentForm]);

  useEffect(() => {
    projectBasePathForm.setValue('ProjectBasePath', ProjectBasePath);
  }, [ProjectBasePath, projectBasePathForm]);

  useEffect(() => {
    preferredEditorForm.setValue('PreferredEditor', PreferredEditor);
  }, [PreferredEditor, preferredEditorForm]);

  // エラーメッセージクリア
  useEffect(() => {
    const timer = setTimeout(() => {
      setEnvironmentSuccessMessage('');
      setProjectBasePathSuccessMessage('');
      setPreferredEditorSuccessMessage('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [
    environmentSuccessMessage,
    projectBasePathSuccessMessage,
    preferredEditorSuccessMessage,
  ]);

  /**
   * 環境設定 フォーム送信時の処理
   */
  const OnEnvironmentSubmit = async (values: EnvironmentFormValues) => {
    try {
      setEnvironmentSuccessMessage('');
      environmentForm.clearErrors('Environment');

      SetEnvironment(values.Environment);
      await SaveEnvironment();

      setEnvironmentSuccessMessage('✅ 環境設定を保存しました');
      console.log(
        '[OnEnvironmentSubmit] 環境設定保存成功:',
        values.Environment
      );
    } catch (CaughtError: any) {
      const ErrorMessage = CaughtError?.message;
      console.error('[OnEnvironmentSubmit] 環境設定保存エラー:', CaughtError);
      setEnvironmentSuccessMessage('');
      environmentForm.setError('Environment', {
        type: 'manual',
        message: ErrorMessage || '環境設定の保存に失敗しました',
      });
    }
  };

  /**
   * プロジェクトベースパス フォーム送信時の処理
   */
  const OnProjectBasePathSubmit = async (values: ProjectBasePathFormValues) => {
    try {
      setProjectBasePathSuccessMessage('');
      projectBasePathForm.clearErrors('ProjectBasePath');

      SetProjectBasePath(values.ProjectBasePath);
      await SaveProjectBasePath();

      setProjectBasePathSuccessMessage(
        '✅ プロジェクトベースパスを保存しました'
      );
      console.log(
        '[OnProjectBasePathSubmit] プロジェクトベースパス保存成功:',
        values.ProjectBasePath
      );
    } catch (CaughtError: any) {
      const ErrorMessage = CaughtError?.message;
      console.error(
        '[OnProjectBasePathSubmit] プロジェクトベースパス保存エラー:',
        CaughtError
      );
      setProjectBasePathSuccessMessage('');
      projectBasePathForm.setError('ProjectBasePath', {
        type: 'manual',
        message: ErrorMessage || 'プロジェクトベースパスの保存に失敗しました',
      });
    }
  };

  /**
   * エディタ設定 フォーム送信時の処理
   */
  const OnPreferredEditorSubmit = async (values: PreferredEditorFormValues) => {
    try {
      setPreferredEditorSuccessMessage('');
      preferredEditorForm.clearErrors('PreferredEditor');

      SetPreferredEditor(values.PreferredEditor);
      await SavePreferredEditor();

      setPreferredEditorSuccessMessage('✅ 使用エディタを保存しました');
      console.log(
        '[OnPreferredEditorSubmit] エディタ設定保存成功:',
        values.PreferredEditor
      );
    } catch (CaughtError: any) {
      const ErrorMessage = CaughtError?.message;
      console.error(
        '[OnPreferredEditorSubmit] エディタ設定保存エラー:',
        CaughtError
      );
      setPreferredEditorSuccessMessage('');
      preferredEditorForm.setError('PreferredEditor', {
        type: 'manual',
        message: ErrorMessage || '使用エディタの保存に失敗しました',
      });
    }
  };

  /**
   * パス入力支援用のサンプルパスを生成
   */
  const GetPathHints = () => {
    const username = 'username'; // 実際のユーザー名は取得できないため固定値
    return [
      `C:\\Users\\${username}\\Documents\\project_app`,
      `D:\\xampp\\htdocs\\project_app`,
      `C:\\dev\\projects\\project_app`,
      `D:\\workspace\\project_app`,
    ];
  };

  /**
   * サンプルパスをクリックした時の処理
   */
  const OnSamplePathClick = (samplePath: string) => {
    projectBasePathForm.setValue('ProjectBasePath', samplePath);
    setShowPathHints(false);
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      {/* 環境設定セクション */}
      <div className='space-y-6'>
        <div>
          <h2 className='text-base font-medium mb-4'>環境設定</h2>

          {/* 環境選択設定 */}
          <Form {...environmentForm}>
            <form
              onSubmit={environmentForm.handleSubmit(OnEnvironmentSubmit)}
              className='space-y-4'>
              <FormField
                control={environmentForm.control}
                name='Environment'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      環境選択
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='環境を選択' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='local'>ローカル環境</SelectItem>
                        <SelectItem value='nd'>ND環境</SelectItem>
                        <SelectItem value='test'>TEST環境</SelectItem>
                        <SelectItem value='production'>本番環境</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      作業環境を選択してください。選択した環境に応じて適切な設定が適用されます。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' disabled={IsLoading} className='w-full'>
                環境設定を保存
              </Button>

              {environmentSuccessMessage && (
                <div className='text-sm text-green-600 mt-2'>
                  {environmentSuccessMessage}
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* プロジェクトベースパス設定セクション */}
        <div>
          <h2 className='text-base font-medium mb-4'>
            プロジェクトベースパス設定
          </h2>

          <Form {...projectBasePathForm}>
            <form
              onSubmit={projectBasePathForm.handleSubmit(
                OnProjectBasePathSubmit
              )}
              className='space-y-4'>
              <FormField
                control={projectBasePathForm.control}
                name='ProjectBasePath'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      プロジェクトベースパス
                    </FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        <Input
                          {...field}
                          placeholder='例: C:\Users\username\Documents\project_app'
                          className='text-sm'
                        />
                        <div className='flex items-center space-x-2'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => setShowPathHints(!showPathHints)}
                            className='text-xs'>
                            💡 パス入力支援
                          </Button>
                          <span className='text-xs text-gray-500'>
                            クリックでサンプルパスを表示
                          </span>
                        </div>

                        {showPathHints && (
                          <div className='mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50'>
                            <div className='text-xs font-medium text-gray-700 mb-2'>
                              💡 サンプルパス（クリックで入力）
                            </div>
                            <div className='space-y-1'>
                              {GetPathHints().map((hint, index) => (
                                <button
                                  key={index}
                                  type='button'
                                  onClick={() => OnSamplePathClick(hint)}
                                  className='block w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors'>
                                  {hint}
                                </button>
                              ))}
                            </div>
                            <div className='mt-2 pt-2 border-t border-gray-200'>
                              <div className='text-xs text-gray-600'>
                                ⚠️ 注意：パスは「_app」で終わる必要があります
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      「_app」フォルダを含むプロジェクトの絶対パスを入力してください。
                      <br />
                      例：C:\Users\username\Documents\project_app
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' disabled={IsLoading} className='w-full'>
                プロジェクトベースパスを保存
              </Button>

              {projectBasePathSuccessMessage && (
                <div className='text-sm text-green-600 mt-2'>
                  {projectBasePathSuccessMessage}
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* エディタ設定セクション */}
        <div>
          <h2 className='text-base font-medium mb-4'>エディタ設定</h2>

          <Form {...preferredEditorForm}>
            <form
              onSubmit={preferredEditorForm.handleSubmit(
                OnPreferredEditorSubmit
              )}
              className='space-y-4'>
              <FormField
                control={preferredEditorForm.control}
                name='PreferredEditor'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      使用エディタ
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='エディタを選択' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='vscode'>
                          Visual Studio Code
                        </SelectItem>
                        <SelectItem value='cursor'>Cursor</SelectItem>
                        <SelectItem value='dreamweaver'>Dreamweaver</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      ファイル編集時に使用するエディタを選択してください。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' disabled={IsLoading} className='w-full'>
                エディタ設定を保存
              </Button>

              {preferredEditorSuccessMessage && (
                <div className='text-sm text-green-600 mt-2'>
                  {preferredEditorSuccessMessage}
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
