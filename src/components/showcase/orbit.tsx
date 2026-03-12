"use client";

import { type Testimonial } from "@/data/sample-testimonials";
import { Star } from "lucide-react";
import { useRef, useEffect, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { type ShowcaseConfig, getCardClasses, getFontClass, shouldShow, formatDate } from "@/lib/showcase-helpers";

import "swiper/css";

interface Props {
  testimonials: Testimonial[];
  autoplay?: boolean;
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  config?: ShowcaseConfig;
}

function CardContent({ t, config }: { t: Testimonial; config?: ShowcaseConfig }) {
  return (
    <>
      {shouldShow("showRating", config) && (
        <div className="mb-3 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, si) => (
            <Star
              key={si}
              className={`size-4 ${si < t.rating ? "fill-accent text-accent" : "text-muted"}`}
            />
          ))}
        </div>
      )}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-foreground/90">
        &ldquo;{t.text}&rdquo;
      </p>
      {shouldShow("showDate", config) && t.createdAt && (
        <p className="mb-2 text-[10px] text-muted-foreground">{formatDate(t.createdAt)}</p>
      )}
      <div className="mt-auto flex items-center gap-3">
        {shouldShow("showPhoto", config) && t.authorPhoto && (
          <img
            src={t.authorPhoto}
            alt={t.authorName}
            className="size-9 rounded-full bg-muted"
          />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {t.authorName}
          </p>
          {shouldShow("showCompany", config) && (
            <p className="truncate text-xs text-muted-foreground">
              {t.authorTitle}, {t.authorCompany}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function getResponsiveRadius(containerWidth: number) {
  if (containerWidth < 480) return 240;
  if (containerWidth < 640) return 340;
  if (containerWidth < 800) return 460;
  return 620;
}

const REPEATS = 5; // repeat slides 5x for seamless manual looping

export function Orbit({
  testimonials,
  autoplay = true,
  speed = "normal",
  pauseOnHover = true,
  config,
}: Props) {
  const count = testimonials.length;
  const card = getCardClasses(config);
  const swiperRef = useRef<SwiperType | null>(null);
  const cardHeightRef = useRef<number>(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const radiusRef = useRef(420);
  const directionRef = useRef(1);

  const ANGLE_STEP = (2 * Math.PI) / (count * 1.1);
  const MAX_TILT = 4;

  // Tripled slides for seamless looping without Swiper's loop mode
  const repeatedSlides = useMemo(() => {
    const arr: { testimonial: Testimonial; key: string }[] = [];
    for (let r = 0; r < REPEATS; r++) {
      for (let i = 0; i < count; i++) {
        arr.push({ testimonial: testimonials[i], key: `${r}-${i}` });
      }
    }
    return arr;
  }, [testimonials, count]);

  // Start in the middle repetition
  const middleStart = Math.floor(REPEATS / 2) * count;

  // Responsive radius
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      radiusRef.current = getResponsiveRadius(el.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure tallest card for uniform height
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const measure = () => {
      let max = 0;
      for (let i = 0; i < el.children.length; i++) {
        max = Math.max(max, (el.children[i] as HTMLElement).offsetHeight);
      }
      if (max > 0 && max !== cardHeightRef.current) {
        cardHeightRef.current = max;
        // Update mask container height
        if (maskRef.current) {
          maskRef.current.style.height = `${max + 48}px`;
        }
        // Update all card heights directly
        const swiper = swiperRef.current;
        if (swiper) {
          for (let i = 0; i < swiper.slides.length; i++) {
            const cardEl = swiper.slides[i]?.firstElementChild as HTMLElement | null;
            if (cardEl) cardEl.style.height = `${max}px`;
          }
        }
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [testimonials, config]);

  // Apply circular transforms based on each slide's progress value
  const applyTransforms = useCallback((swiper: SwiperType) => {
    const r = radiusRef.current;

    for (let i = 0; i < swiper.slides.length; i++) {
      const slide = swiper.slides[i] as HTMLElement;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = slide as any;
      const progress = s.progress ?? 0;

      // Only render slides within half a cycle — hides duplicate repeats
      const halfCycle = Math.ceil(count / 2);
      if (Math.abs(progress) > halfCycle) {
        slide.style.opacity = "0";
        slide.style.visibility = "hidden";
        continue;
      }

      const angle = progress * ANGLE_STEP;
      const circularX = Math.sin(angle) * r;
      const dir = directionRef.current;
      const zBias = Math.sin(angle) * dir * 45;
      const z = (Math.cos(angle) - 1) * 400 + zBias;
      const depthNorm = (Math.cos(angle) + 1) / 2;
      const eased = Math.pow(depthNorm, 0.4);
      const scale = 0.82 + eased * 0.18;
      const opacity = depthNorm < 0.08 ? 0 : 0.4 + eased * 0.6;
      const tiltY = -Math.sin(angle) * MAX_TILT;

      // Counteract the slide's grid position so everything orbits from center
      const slideOffset = s.swiperSlideOffset ?? 0;
      const slideCenter = slideOffset + slide.offsetWidth / 2;
      const containerCenter = swiper.width / 2;
      const gridCorrection = slideCenter - containerCenter;
      const finalX = circularX - gridCorrection;

      slide.style.transform = `translateX(${finalX}px) translateZ(${z}px) rotateY(${tiltY}deg) scale(${scale})`;
      slide.style.opacity = String(opacity);
      slide.style.visibility = depthNorm < 0.08 ? "hidden" : "visible";
    }

  }, [count, ANGLE_STEP]);

  // Setup: enable native 3D depth sorting on the wrapper
  const onSwiper = useCallback((s: SwiperType) => {
    swiperRef.current = s;
    s.wrapperEl.style.transformStyle = "preserve-3d";
    // Start at the middle repetition
    s.slideTo(middleStart, 0);
  }, [middleStart]);

  // Custom RAF loop: continuous rotation with smooth velocity easing
  useEffect(() => {
    if (!swiperRef.current || !autoplay) return;
    const swiper = swiperRef.current;

    let velocity = 0;
    const targetPxPerSec = speed === "slow" ? 40 : speed === "fast" ? 120 : 70;
    const EASE_RATE = 2.5;
    let lastTime = 0;
    let rafId = 0;
    let hovered = false;
    let dragging = false;

    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };

    if (pauseOnHover) {
      swiper.el.addEventListener("mouseenter", onEnter);
      swiper.el.addEventListener("mouseleave", onLeave);
    }
    swiper.on("touchStart", () => { dragging = true; });
    swiper.on("touchEnd", () => { dragging = false; lastTime = 0; });

    function tick(time: number) {
      if (lastTime === 0) lastTime = time;
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (dragging) {
        velocity = 0;
        rafId = requestAnimationFrame(tick);
        return;
      }

      const desired = hovered && pauseOnHover ? 0 : targetPxPerSec;
      const diff = desired - velocity;
      velocity += diff * Math.min(1, EASE_RATE * delta);

      if (Math.abs(velocity) < 0.5 && desired === 0) {
        velocity = 0;
      }

      directionRef.current = velocity >= 0 ? 1 : -1;

      if (velocity > 0) {
        if (swiper.destroyed) { return; }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = swiper as any;
        const newTranslate = s.getTranslate() + velocity * delta;

        s.setTransition(0);
        s.setTranslate(newTranslate);
        s.updateProgress();
        s.updateActiveIndex();

        applyTransforms(swiper);

        // Manual loop: if we've drifted too far from the middle, reset silently
        const slideWidth = swiper.slides[0]?.offsetWidth || 340;
        const cycleWidth = count * slideWidth;
        const middleTranslate = -(middleStart * slideWidth) + (swiper.width / 2) - (slideWidth / 2);
        const currentTranslate = s.getTranslate();
        const drift = currentTranslate - middleTranslate;

        if (Math.abs(drift) > cycleWidth) {
          const resetTranslate = currentTranslate - Math.sign(drift) * cycleWidth;
          s.setTranslate(resetTranslate);
          s.updateProgress();
          s.updateActiveIndex();
          applyTransforms(swiper);
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      if (pauseOnHover && swiper.el) {
        swiper.el.removeEventListener("mouseenter", onEnter);
        swiper.el.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [autoplay, speed, pauseOnHover, applyTransforms, count, middleStart]);

  return (
    <div ref={containerRef} className={`relative mx-auto flex min-h-[340px] w-full flex-col justify-center ${getFontClass(config)}`}>
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 -z-10 opacity-0"
      >
        {testimonials.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col ${card} p-5 sm:p-6`}
            style={{ width: 340, maxWidth: "85vw" }}
          >
            <CardContent t={item} config={config} />
          </div>
        ))}
      </div>

      {/* Mask container for edge fading */}
      <div
        ref={maskRef}
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          height: 380,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Swiper
          onSwiper={onSwiper}
          virtualTranslate
          watchSlidesProgress
          centeredSlides
          slidesPerView="auto"
          grabCursor
          speed={400}
          onSetTranslate={(swiper) => applyTransforms(swiper)}
          className="orbit-swiper"
          style={{
            overflow: "visible",
            perspective: "1200px",
            width: "100%",
          }}
        >
          {repeatedSlides.map(({ testimonial: t, key }) => (
            <SwiperSlide key={key} style={{ width: "340px", maxWidth: "85vw" }}>
              <div
                className={`flex flex-col ${card} p-5 sm:p-6`}
                style={{ height: "auto" }}
              >
                <CardContent t={t} config={config} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {shouldShow("showBranding", config) && (
        <div className="pt-3 text-center text-[10px] text-muted-foreground/50">
          Powered by ProofWall
        </div>
      )}
    </div>
  );
}
