export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#EEE8DF] text-[#4B3935]">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="opacity-80">The page you are looking for doesn’t exist.</p>
      <a href={import.meta.env.BASE_URL} className="underline">Go to Home</a>
    </div>
  );
}
