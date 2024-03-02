/* eslint-disable i18next/no-literal-string */
import { CaiLogo } from '@/components/Common/CaiLogo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { ClientEnv } from '@/env/client.mjs';
import { DEPLOYMENT_COOKIE_NAME } from '@/utils/constants';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

enum DeploymentType {
  PROD = 'prod',
  CANARY = 'canary',
}

export const DeploymentSelector = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [webDeployment, setWebDeployment] = useState<DeploymentType>(
    DeploymentType.PROD,
  );

  const [neoCookieValue, setNeoCookieValue] = useState(
    Cookies.get('NEO_HOST_BASE') || '',
  );
  const [charCookieValue, setCharCookieValue] = useState(
    Cookies.get('CHAR_SERVER_URL') || '',
  );

  useEffect(() => {
    const deploymentCookie = Cookies.get(DEPLOYMENT_COOKIE_NAME);

    if (deploymentCookie) {
      setWebDeployment(deploymentCookie as DeploymentType);
    }
  }, []);

  if (user?.user?.is_staff !== true) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className="absolute z-50 right-20 bottom-3 hidden sm:block"
        asChild
      >
        <Button
          className="rounded-full bg-surface-elevation-2"
          disableRipple
          onPress={() => setIsOpen(!isOpen)}
          isIconOnly
          variant="ghost"
          startContent
        >
          <CaiLogo mini className="justify-center" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Tabs defaultValue="frontend" className="w-[200px] h-[200px] mx-4">
          <TabsList>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
          </TabsList>
          <TabsContent value="backend">
            <DropdownMenuRadioGroup
              value={webDeployment}
              onValueChange={(val) => {
                setWebDeployment(val as DeploymentType);
                Cookies.set(DEPLOYMENT_COOKIE_NAME, val);
                window.location.reload();
              }}
            >
              <Input
                label="NEO_HOST_BASE"
                className="w-52"
                placeholder={ClientEnv.NEXT_PUBLIC_NEO_HOST_BASE}
                onChange={(e) => {
                  // Cookies.set('NEO_HOST_BASE', e.target.value);
                  setNeoCookieValue(e.target.value);
                }}
                value={neoCookieValue}
              />
              <Input
                label="CHAR_SERVER_URL"
                className="w-52"
                placeholder={ClientEnv.NEXT_PUBLIC_CHAR_SERVER_URL}
                onChange={(e) => {
                  // Cookies.set('CHAR_SERVER_URL', e.target.value);
                  setCharCookieValue(e.target.value);
                }}
                value={charCookieValue}
              />
              <Button
                onPress={() => {
                  if (charCookieValue) {
                    Cookies.set('CHAR_SERVER_URL', charCookieValue);
                  }
                  if (neoCookieValue) {
                    Cookies.set('NEO_HOST_BASE', neoCookieValue);
                  }
                  window.location.reload();
                }}
              >
                Save
              </Button>
            </DropdownMenuRadioGroup>
          </TabsContent>
          <TabsContent value="frontend">
            <DropdownMenuRadioGroup
              value={webDeployment}
              onValueChange={(val) => {
                setWebDeployment(val as DeploymentType);
                Cookies.set(DEPLOYMENT_COOKIE_NAME, val);
                window.location.reload();
              }}
            >
              <DropdownMenuRadioItem value={DeploymentType.PROD}>
                Production (prod)
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={DeploymentType.CANARY}>
                Canary (main)
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
