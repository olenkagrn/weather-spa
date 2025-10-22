'use client';

import styles from './global-error.module.scss';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className={styles.container}>
          <h2 className={styles.title}>Something went wrong!</h2>
          <p className={styles.message}>
            {error.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => reset()}
            className={styles.button}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
