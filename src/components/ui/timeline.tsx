"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}


export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const container = containerRef.current;
    const lastItem = lastItemRef.current;

    if (!container || !lastItem) return;

    const containerRect = container.getBoundingClientRect();
    const lastRect = lastItem.getBoundingClientRect();
    const nextLineHeight = Math.max(0, lastRect.bottom - containerRect.top);
    const viewportHeight = window.innerHeight;
    const scrollDistance = Math.max(1, containerRect.height - viewportHeight * 0.4);
    const rawProgress = (viewportHeight * 0.1 - containerRect.top) / scrollDistance;
    const nextProgress = Math.min(1, Math.max(0, rawProgress));

    setLineHeight(nextLineHeight);
    setScrollProgress(nextProgress);
  }, []);

  useEffect(() => {
    updateProgress();

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    let resizeObserver: ResizeObserver | null = null;

    if ("ResizeObserver" in window && containerRef.current) {
      resizeObserver = new ResizeObserver(updateProgress);
      resizeObserver.observe(containerRef.current);

      if (lastItemRef.current) {
        resizeObserver.observe(lastItemRef.current);
      }
    }

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      resizeObserver?.disconnect();
    };
  }, [data.length, updateProgress]);

  const timelineFillHeight = lineHeight * scrollProgress;
  const timelineFillOpacity = Math.min(1, scrollProgress / 0.1);

  return (
    <div
      className="w-full bg-white dark:bg-neutral-950 font-sans md:px-10"
    >
      <div ref={containerRef} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => {
          const isLast = index === data.length - 1;
          return (
            <div
              key={index}
              ref={isLast ? lastItemRef : undefined}
              className="flex flex-col md:flex-row justify-start my-8 md:my-16 gap-6 md:gap-12 px-2 md:px-8"
            >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500 ">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
          );
        })}
        <div
          style={{
            height: lineHeight + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <div
            style={{
              height: `${timelineFillHeight}px`,
              opacity: timelineFillOpacity,
            }}
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full transition-[height,opacity] duration-150 ease-out"
          />
        </div>
      </div>
    </div>
  );
};

