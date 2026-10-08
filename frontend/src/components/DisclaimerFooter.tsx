
export function DisclaimerFooter({ text }: { text?: string }) {
  if (!text) return null;
  
  return (
    <footer className="w-full py-space-md px-space-lg mt-space-xl border-t border-outline-variant bg-surface-container-lowest">
      <div className="flex items-start gap-space-sm">
        <span className="material-symbols-outlined text-outline text-[20px]">info</span>
        <p className="font-body-sm text-body-sm text-on-surface-variant flex-1">
          <span className="font-semibold text-on-surface">Clinical Disclaimer:</span> {text}
        </p>
      </div>
    </footer>
  );
}
