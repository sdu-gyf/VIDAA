import { ReactNode } from 'react';

export interface LayoutProps {
  children?: ReactNode;
}

export interface GenVideoLayoutProps extends LayoutProps {
  maxWidth?: string;
  padding?: string;
}
