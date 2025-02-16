import { Outlet } from 'react-router-dom'
import { GenVideoLayoutProps } from '../../types/layout'

export function GenVideoLayout({
  maxWidth = "max-w-7xl",
  padding = "px-4"
}: GenVideoLayoutProps) {
  return (
    <div className={`${maxWidth} mx-auto ${padding}`}>
      <Outlet />
    </div>
  )
}
