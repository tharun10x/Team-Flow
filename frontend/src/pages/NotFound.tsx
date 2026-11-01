import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-paper font-body text-ink">
      <header className="flex h-14 items-center border-b border-rule px-6">
        <span className="font-display text-xl font-semibold tracking-display text-ink">TeamFlow</span>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">

        {/* The status code, set as the page's one figure */}
        <h1 className="font-display text-[clamp(6rem,16vw,12rem)] font-semibold leading-none tracking-display text-muted max-w-none">
          404
        </h1>

        <h2 className="mt-6 font-display text-3xl font-semibold tracking-display text-ink">
          Oops! You seem to be lost.
        </h2>

        <p className="mt-3 max-w-md text-ink-2">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="btn btn-lg"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn btn-quiet btn-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

      </main>
    </div>
  );
}
