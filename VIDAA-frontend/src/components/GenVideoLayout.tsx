import { Outlet } from 'react-router-dom'

export function GenVideoLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <Outlet />
    </div>
  )
}
