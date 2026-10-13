import { Loader } from './States'

/** Shown while a lazily loaded route is being fetched. Keeps the app shell visible. */
export function RouteFallback() {
  return <Loader label="Loading…" className="py-24" />
}
