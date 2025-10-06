import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Counter = () => {
  const [count, setCount] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Get the current count from localStorage
    const storedCount = localStorage.getItem("refreshCount");
    const currentCount = storedCount ? parseInt(storedCount, 10) : 0;
    
    // Increment the count
    const newCount = currentCount + 1;
    
    // Save to localStorage
    localStorage.setItem("refreshCount", newCount.toString());
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => {
      setCount(newCount);
      setIsAnimating(false);
    }, 100);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-4">
            Refresh Counter
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            This page has been refreshed
          </p>
        </motion.div>

        <motion.div
          key={count}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" 
               style={{ filter: "blur(60px)" }} />
          <div className="relative bg-card border border-primary/30 rounded-3xl p-12 md:p-16 shadow-2xl backdrop-blur-sm">
            <motion.div
              animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="text-8xl md:text-9xl font-bold text-gradient tabular-nums"
            >
              {count.toLocaleString()}
            </motion.div>
            <p className="text-secondary text-xl md:text-2xl font-semibold mt-4">
              {count === 1 ? "time" : "times"}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-muted-foreground text-sm md:text-base"
        >
          <p>Press <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono text-xs">F5</kbd> or <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono text-xs">Ctrl+R</kbd> to refresh</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Counter;
