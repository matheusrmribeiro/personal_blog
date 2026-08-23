import type { CSSProperties } from 'react';
import styles from './animated-headline.module.css';

const headline = 'Ideas, experiments, and lessons from the workbench.';

type LetterStyle = CSSProperties & {
  '--letter-index': number;
};

export function AnimatedHeadline() {
  let letterIndex = 0;

  return (
    <>
      <span className="sr-only">{headline}</span>
      <span aria-hidden="true">
        {headline.split(' ').map((word) => (
          <span className={styles.word} key={word}>
            {Array.from(word).map((letter) => {
              const index = letterIndex++;
              const style: LetterStyle = { '--letter-index': index };

              return (
                <span className={styles.letter} key={`${letter}-${index}`} style={style}>
                  {letter}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </>
  );
}
