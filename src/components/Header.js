import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-gray-800 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-center">
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer">
            Craft Die Manager
          </h1>
        </Link>
      </div>
    </header>
  );
}
