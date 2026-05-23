import WaitlistPage from '@/components/WaitlistPage';
import { readCount } from '@/lib/waitlist';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let initialCount = 0;
  try {
    initialCount = await readCount();
  } catch (err) {
    console.error('[page] count read failed', err);
  }
  return <WaitlistPage initialCount={initialCount} />;
}
