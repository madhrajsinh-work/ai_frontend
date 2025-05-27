import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center bg-gray-900 text-white">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-30"
        src="/assets/hero-bg.mp4"
        autoPlay
        loop
        muted
      />
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Automate Everything with <span className="text-blue-500">AI</span>
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Boost productivity, reduce manual tasks, and grow faster with our intelligent automation chatbot.
        </motion.p>
      </div>
    </section>
  );
}
