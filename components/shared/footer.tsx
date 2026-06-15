export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-semibold text-slate-900">Mediva AI</p>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Safe, simplified medical explanations for everyday users. Educational
            information only, always consult a qualified doctor for decisions.
          </p>
        </div>
        <div className="text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Product</p>
          <p className="mt-2">Dashboard</p>
          <p>Medical OCR</p>
          <p>AI Insights</p>
        </div>
        <div className="text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Company</p>
          <p className="mt-2">Privacy</p>
          <p>Terms</p>
          <p>Support</p>
        </div>
      </div>
    </footer>
  );
}
