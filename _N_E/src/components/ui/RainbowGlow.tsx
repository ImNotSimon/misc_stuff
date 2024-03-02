import { motion } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.05,
    },
  }),
};

export const RainbowGlow = ({
  children,
  custom,
}: {
  children: React.ReactNode;
  custom?: number;
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={variants}
    className="rainbow-glow"
    custom={custom}
  >
    {children}
  </motion.div>
);
