"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/* ease-out-fluid: entering elements start fast and settle (animate-ui rule). */
const EASE = [0.32, 0.72, 0, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function Reveal({ children, className, delay = 0, y = 16 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -64px 0px" }}
      transition={{ duration: reduceMotion ? 0 : 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
