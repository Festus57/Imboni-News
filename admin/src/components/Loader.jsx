export default function Loader({ text = 'Gutegereza...' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[40vh] gap-3">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
