import React from 'react';
import { motion } from 'motion/react';

/**
 * AnimatedIcon Component
 * Inspired by lucide-animated.com & animateicons.in
 * Adds interactive micro-animations (bounce, rotate, scale, wiggle, pulse) to Lucide icons on hover and focus.
 *
 * @param {Object} props
 * @param {React.ElementType} props.icon - Lucide icon component (e.g., Sparkles, Store, MapPin)
 * @param {string} [props.animation="bounce"] - "bounce" | "wiggle" | "scale" | "rotate" | "pulse" | "spin"
 * @param {string} [props.className=""] - CSS classes
 * @param {number} [props.size] - Icon size in px
 * @param {string} [props.color] - Icon color
 */
export default function AnimatedIcon({
  icon: IconComponent,
  animation = "bounce",
  className = "",
  size,
  color,
  ...rest
}) {
  if (!IconComponent) return null;

  // Define animation presets matching lucide-animated
  const animations = {
    bounce: {
      whileHover: { y: [0, -4, 0, -2, 0], scale: 1.1 },
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    wiggle: {
      whileHover: { rotate: [0, -12, 12, -8, 8, 0], scale: 1.1 },
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    scale: {
      whileHover: { scale: 1.2, rotate: 6 },
      whileTap: { scale: 0.9 },
      transition: { type: "spring", stiffness: 400, damping: 17 },
    },
    rotate: {
      whileHover: { rotate: 180 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
    pulse: {
      whileHover: { scale: [1, 1.25, 1], opacity: [1, 0.8, 1] },
      transition: { duration: 0.6, repeat: Infinity, repeatType: "reverse" },
    },
    spin: {
      whileHover: { rotate: 360 },
      transition: { duration: 0.6, ease: "linear" },
    },
  };

  const selectedAnimation = animations[animation] || animations.scale;

  return (
    <motion.span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      {...selectedAnimation}
      {...rest}
    >
      <IconComponent size={size} color={color} className="w-full h-full" />
    </motion.span>
  );
}
