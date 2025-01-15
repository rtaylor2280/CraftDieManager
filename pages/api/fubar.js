export async function GET() {
  return new Response(JSON.stringify({ message: "Fubar API is working" }), { status: 200 });
}
