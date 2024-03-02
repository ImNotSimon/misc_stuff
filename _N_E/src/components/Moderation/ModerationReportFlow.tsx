import {
  ReportCategories,
  type ReportCategoryListItem,
} from '@/components/Moderation/ModerationCategories';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReportMutation } from '@character-tech/client-common/src/hooks/queries/moderation';
import {
  type ModerationReport,
  type ReportCategory,
} from '@character-tech/client-common/src/types/moderation';
import { t } from 'i18next';
import { useEffect, useState } from 'react';

export const ModerationReportFlow = ({
  report,
  onComplete,
  selectedCategory,
}: {
  report: ModerationReport;
  onComplete: () => void;
  selectedCategory?: ReportCategory;
}) => {
  const { mutate: createReport, isLoading } = useCreateReportMutation();
  const [categories, setCategories] = useState<ReportCategoryListItem[]>(
    selectedCategory ? [] : ReportCategories,
  );
  const [category, setCategory] = useState<ReportCategory | undefined>(
    selectedCategory,
  );
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  useEffect(() => {
    switch (report.type) {
      case 'MESSAGE':
        setTitle(t('Moderation.report-message-title'));
        break;
      case 'ROOM':
        setTitle(t('Moderation.report-room-title'));
        break;
      case 'CHARACTER':
        setTitle(t('Moderation.report-character'));
        break;
      case 'VOICE':
        setTitle(t('Moderation.report-voice-title'));
        break;
      default:
        break;
    }
  }, [report.type]);

  const submitReport = () => {
    if (!category) {
      return;
    }

    createReport(
      { report, category, comment },
      {
        onSuccess: () => {
          onComplete();
        },
        onError: (error) => {
          console.error('Failed to create moderation reprot', error);
        },
      },
    );
  };

  const updateCategorySelection = (item: ReportCategoryListItem) => {
    switch (item.value.type) {
      case 'CATEGORY_LIST':
        setCategories(item.value.categories);
        setTitle(item.label);
        break;
      case 'CATEGORY':
        setCategories([]);
        setCategory(item.value.category);
        setTitle(t('Moderation.leave-comment'));
        break;
      case 'CUSTOM_ACTION':
        item.value.action();
        onComplete();
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div className="font-semibold mb-2">{title}</div>
      <Separator className="" />
      <div className="mt-2 gap-2">
        <div>
          {categories.map((c) => (
            <Button
              className="flex justify-between w-fit mt-4"
              key={c.label}
              onPress={() => updateCategorySelection(c)}
            >
              {c.label}
            </Button>
          ))}
        </div>
        {!!category && (
          <div>
            <Textarea
              value={comment}
              rows={4}
              placeholder={t('Moderation.comment-placeholder')}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button
              className="mt-2"
              onPress={submitReport}
              disabled={isLoading}
            >
              {t('Common.submit')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
