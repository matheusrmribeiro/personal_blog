'use client';

import { useEffect, useState } from 'react';
import styles from './rotating-headline.module.css';

const words = ['Ideas', 'experiments', 'lessons'] as const;

export function RotatingHeadline() {
  const [rotation, setRotation] = useState<{
    currentIndex: number;
    previousIndex: number | null;
  }>({ currentIndex: 0, previousIndex: null });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRotation(({ currentIndex }) => ({
        currentIndex: (currentIndex + 1) % words.length,
        previousIndex: currentIndex,
      }));
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  const word = words[rotation.currentIndex];

  return (
    <span>
      <span className="sr-only">{word} from the workbench.</span>
      <span aria-hidden="true">
        <span className={styles.wordFrame}>
          <span className={styles.measure}>experiments</span>
          {rotation.previousIndex === null ? null : (
            <span
              className={`${styles.word} ${styles.wordOut}`}
              key={`out-${words[rotation.previousIndex]}-${word}`}
            >
              {words[rotation.previousIndex]}
            </span>
          )}
          <span
            className={`${styles.word} ${styles.wordIn}`}
            key={`in-${word}`}
          >
            {word}
          </span>
        </span>{' '}
        from the workbench.
      </span>
    </span>
  );
}
