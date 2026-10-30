import { Logo } from "./Logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto my-auto w-full max-w-sm py-12">
          <h1 className="font-display text-4xl">{title}</h1>
          <p className="mb-8 mt-2 text-sm text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-line lg:block">
        <video className="absolute inset-0 h-full w-full object-cover" src="https://www.inkframefilms.com/aura/night-shift-loop.mp4" poster="https://www.inkframefilms.com/aura/night-shift.jpg" autoPlay muted loop playsInline />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="font-display text-4xl leading-tight">&ldquo;One small disaster per episode, fifteen seconds at a time.&rdquo;</p>
          <p className="mt-3 text-sm text-muted">The format that took Aura from 0 to 413K followers in 75 days.</p>
        </div>
      </div>
    </div>
  );
}
