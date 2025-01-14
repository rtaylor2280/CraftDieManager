import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="bg-gray-100 p-4 w-64 min-h-screen">
      <ul className="space-y-4">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/gallery">Gallery</Link></li>
        <li><Link href="/dies">Dies</Link></li>
        <li><Link href="/locations">Locations</Link></li>
        <li><Link href="/settings">Settings</Link></li>
      </ul>
    </aside>
  );
}
