import { Button } from '@/components/ui/button';
import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookIcon, HelpFilledIcon, InfoFilledIcon } from '@/components/ui/Icon';
import { ExternalLinks } from '@/utils/constants';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type FooterLink = { label: string; href: string; icon?: ReactNode };

export function Footer() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const FooterLinks: FooterLink[] = [
    {
      label: t('Common.about'),
      href: ExternalLinks.about,
    },
    {
      label: t('ExternalLinks.careers'),
      href: ExternalLinks.careers,
    },
    { label: t('Guide.blog'), href: ExternalLinks.blog },
  ];

  const HelpLinks: FooterLink[] = [
    {
      label: t('ExternalLinks.character-guide'),
      href: ExternalLinks.characterGuide,
      icon: <BookIcon height="1.25em" className="text-muted-foreground" />,
    },
    {
      label: t('Help.about-us'),
      href: ExternalLinks.about,
      icon: (
        <InfoFilledIcon height="1.25em" className="text-muted-foreground" />
      ),
    },
    {
      label: t('ExternalLinks.support'),
      href: ExternalLinks.support,
      icon: (
        <HelpFilledIcon height="1.25em" className="text-muted-foreground" />
      ),
    },
  ];

  const LegalLinks = [
    {
      label: t('Help.privacy-policy'),
      href: ExternalLinks.privacyPolicy,
    },
    {
      label: t('Help.terms-of-service'),
      href: ExternalLinks.tos,
    },
  ];
  return (
    <div className="flex w-full sm:static sticky justify-center gap-8 flex-row my-4 text-muted-foreground">
      {FooterLinks.map((link) => (
        <LinkWithAnalytics
          key={link.label}
          href={link.href}
          target="_blank"
          className="flex items-center hover:text-foreground"
          analyticsProps={{
            eventName: AnalyticsEvents.Links.Opened,
            properties: { link, referrer: 'footer', type: 'footer_links' },
          }}
        >
          {link.label}
        </LinkWithAnalytics>
      ))}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger
          className="absolute z-50 right-6 sm:bottom-3 bottom-0 sm:block"
          asChild
        >
          <Button
            className="rounded-full bg-surface-elevation-2"
            disableRipple
            onPress={() => setIsOpen(!isOpen)}
            isIconOnly
            variant="ghost"
          >
            ?
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 absolute -right-1 bottom-12 tracking-wide"
        >
          {HelpLinks.map((link) => (
            <DropdownMenuItem
              key={link.label}
              className="cursor-pointer rounded-spacing-s"
            >
              <LinkWithAnalytics
                href={link.href}
                target="_blank"
                className="justify-start items-center gap-3 flex w-full text-md p-2"
                analyticsProps={{
                  eventName: AnalyticsEvents.Links.Opened,
                  properties: { link, referrer: 'footer', type: 'help' },
                }}
              >
                {link.icon}
                {link.label}
              </LinkWithAnalytics>
            </DropdownMenuItem>
          ))}
          {LegalLinks.map((link) => (
            <DropdownMenuItem
              key={link.label}
              className="cursor-pointer rounded-spacing-s"
            >
              <LinkWithAnalytics
                href={link.href}
                target="_blank"
                className="justify-start items-center gap-3 flex w-full text-sm text-muted-foreground p-2"
                analyticsProps={{
                  eventName: AnalyticsEvents.Links.Opened,
                  properties: { link, referrer: 'footer', type: 'legal' },
                }}
              >
                {link.label}
              </LinkWithAnalytics>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem className="cursor-pointer rounded-spacing-s">
            <LinkWithAnalytics
              href="https://beta.character.ai/privacy-choices"
              target="_blank"
              className="justify-start items-center gap-3 flex w-full text-sm text-muted-foreground p-2"
              analyticsProps={{
                eventName: AnalyticsEvents.Links.Opened,
                properties: {
                  link: 'https://beta.character.ai/privacy-choices',
                  referrer: 'footer',
                  type: 'privacy',
                },
              }}
            >
              {t('Help.your-privacy-choices')}
              <Image
                alt="ccpa"
                src="https://characterai.io/ccpa-icon.png"
                width={25}
                height={14}
              />
            </LinkWithAnalytics>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
