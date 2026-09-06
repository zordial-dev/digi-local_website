import React from 'react';
import { motion } from 'motion/react';

export function ScrollTextReveal({
  children,
  text,
  className = '',
  as: Component = 'h2',
  delay = 0,
  stagger = 0.04,
  duration = 0.8,
  yOffset = 24,
  blur = true,
  once = true,
  mode = 'word' // 'word' | 'line' | 'block'
}) {
  const content = text || (typeof children === 'string' ? children : null);

  // Fallback for non-string children
  if (!content) {
    return (
      <motion.div
        initial={{ opacity: 0, y: yOffset, filter: blur ? 'blur(10px)' : 'none' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once, margin: '-10% 0px -10% 0px' }}
        transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  if (mode === 'word') {
    const words = content.split(' ');
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: stagger,
          delayChildren: delay,
        },
      },
    };

    const wordVariants = {
      hidden: {
        opacity: 0,
        y: yOffset,
        filter: blur ? 'blur(8px)' : 'none',
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    };

    return (
      <Component className={`${className} inline-flex flex-wrap gap-x-[0.28em] gap-y-[0.1em] overflow-hidden py-1`}>
        <motion.span
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once, margin: '-8% 0px -8% 0px' }}
          className="inline-flex flex-wrap gap-x-[0.28em] gap-y-[0.1em]"
        >
          {words.map((word, i) => (
            <motion.span key={i} variants={wordVariants} className="inline-block transform-gpu">
              {word}
            </motion.span>
          ))}
        </motion.span>
      </Component>
    );
  }

  return (
    <Component className={className}>
      <motion.span
        initial={{ opacity: 0, y: yOffset, filter: blur ? 'blur(10px)' : 'none' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once, margin: '-10% 0px -10% 0px' }}
        transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
        className="inline-block w-full transform-gpu"
      >
        {content}
      </motion.span>
    </Component>
  );
}

export default ScrollTextReveal;
