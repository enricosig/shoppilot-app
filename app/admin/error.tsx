'use client';
export default function Error({ error }: { error: Error }) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="rounded-xl border p-4 bg-red-50 text-red-700">
        Admin error: {error.message}
      </div>
    </div>
  );
}
