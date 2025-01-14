import Link from "next/link";

export default function Button({ text, href, bgColor }) {
  return (
    <Link
      href={href}
      className={`w-full sm:w-auto text-center px-4 py-3 font-semibold rounded-lg shadow-md hover:brightness-110 transition-all ${bgColor} text-white`}
    >
      {text}
    </Link>
  );
}
