import { AnimatePresence, motion } from 'framer-motion';

export function AnimationFadeInAndOut({
  children,
  className = '',
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
