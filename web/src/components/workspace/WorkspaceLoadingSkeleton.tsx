import styles from './WorkspaceLoadingSkeleton.module.css';

interface WorkspaceLoadingSkeletonProps {
  label?: string;
  contentOnly?: boolean;
}

export function WorkspaceLoadingSkeleton({
  label = 'Loading SharpMind workspace...',
  contentOnly = false,
}: WorkspaceLoadingSkeletonProps) {
  return (
    <div
      className={contentOnly ? styles.content : styles.screen}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {!contentOnly && (
        <aside className={styles.sidebar} aria-hidden="true">
          <div className={`${styles.block} ${styles.brand}`} />
          <div className={styles.navGroup}>
            <div className={`${styles.block} ${styles.navLabel}`} />
            {[1, 2, 3, 4].map((item) => (
              <div className={styles.navItem} key={item}>
                <div className={`${styles.block} ${styles.navIcon}`} />
                <div className={`${styles.block} ${styles.navText}`} />
              </div>
            ))}
          </div>
          <div className={styles.navGroup}>
            <div className={`${styles.block} ${styles.navLabel}`} />
            {[1, 2].map((item) => (
              <div className={styles.navItem} key={item}>
                <div className={`${styles.block} ${styles.navIcon}`} />
                <div className={`${styles.block} ${styles.navText}`} />
              </div>
            ))}
          </div>
        </aside>
      )}

      <div className={styles.main} aria-hidden="true">
        {!contentOnly && (
          <header className={styles.topBar}>
            <div className={`${styles.block} ${styles.breadcrumb}`} />
            <div className={`${styles.block} ${styles.avatar}`} />
          </header>
        )}
        <div className={styles.page}>
          <div className={`${styles.block} ${styles.eyebrow}`} />
          <div className={`${styles.block} ${styles.heading}`} />
          <div className={`${styles.block} ${styles.subheading}`} />
          <div className={styles.cards}>
            {[1, 2, 3].map((item) => (
              <div className={styles.card} key={item}>
                <div className={`${styles.block} ${styles.cardIcon}`} />
                <div className={`${styles.block} ${styles.cardTitle}`} />
                <div className={`${styles.block} ${styles.cardLine}`} />
                <div className={`${styles.block} ${styles.cardLineShort}`} />
              </div>
            ))}
          </div>
          <span className={styles.label}>{label}</span>
        </div>
      </div>
    </div>
  );
}
