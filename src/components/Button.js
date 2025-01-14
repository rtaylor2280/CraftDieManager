import Link from "next/link";

export default function Button({ text, href, bgColor = "bg-blue-500" }) {
  return (
    <Link href={href}>
      <button
        className={`px-6 py-3 text-lg font-semibold rounded-lg shadow-md focus:outline-none ${bgColor} text-white hover:bg-blue-700`}
      >
        {text}
      </button>
    </Link>
  );
}
