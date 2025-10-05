'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import { CloudUpload, Terminal, AutoAwesomeMotion } from '@mui/icons-material';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function HowItWorks() {
  const { t } = useTranslation('home');
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    if (!swiperInstance) return;

    if (prevRef.current && nextRef.current && swiperInstance.params?.navigation && swiperInstance.navigation) {
      swiperInstance.params.navigation.prevEl = prevRef.current;
      swiperInstance.params.navigation.nextEl = nextRef.current;
      swiperInstance.navigation.prevEl = prevRef.current;
      swiperInstance.navigation.nextEl = nextRef.current;
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
    }

    if (paginationRef.current && swiperInstance.params?.pagination && swiperInstance.pagination) {
      const el = paginationRef.current;
      swiperInstance.params.pagination.el = el;
      swiperInstance.pagination.el = el;
      swiperInstance.pagination.init();
      swiperInstance.pagination.render();
      swiperInstance.pagination.update();

      // Ensure pagination container stays inline with buttons
      el.style.position = 'static';
      el.style.width = 'auto';
    }

    const extraPaginations = swiperInstance.el?.querySelectorAll('.swiper-pagination');
    extraPaginations?.forEach((node) => {
      if (node !== paginationRef.current) {
        node.remove();
      }
    });
  }, [swiperInstance]);

  const steps = [
    { key: 'ingest', icon: CloudUpload, annotation: '00:00:00', glideKey: 'how.steps.upload' },
    { key: 'analyze', icon: Terminal, annotation: '00:00:03', glideKey: 'how.steps.api' },
    { key: 'respond', icon: AutoAwesomeMotion, annotation: '00:00:09', glideKey: 'how.steps.result' },
  ];

  return (
      <section id="how" className="py-16 sm:py-20 bg-gradient-to-b from-white via-slate-50/60 to-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          {/* Header */}
          <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
            {t('how.eyebrow', '이용방법')}
          </h3>
          <p className="mt-3 text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {t('how.title', '올리고 나면 바로 시작돼요')}
          </p>
          <p className="mt-4 text-[13px] sm:text-base md:text-lg text-slate-600">
            {t('how.subtitle', '다른 일을 하러 가도 분석은 백그라운드에서 계속돼요.')}
          </p>

          {/* Swiper section */}
          <div className="mt-12 w-full">
            <Swiper
                modules={[Navigation, Pagination, A11y]}
                spaceBetween={40}
                slidesPerView={1}
                pagination={{
                  clickable: true,
                  bulletClass:
                      'swiper-pagination-bullet border border-indigo-300 bg-white opacity-100 mx-1',
                  bulletActiveClass:
                      'swiper-pagination-bullet-active bg-indigo-500 border-indigo-500',
                }}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                onSwiper={setSwiperInstance}
                breakpoints={{
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                className="pb-10"
            >
              {steps.map(({ key, icon: Icon, annotation, glideKey }) => (
                  <SwiperSlide key={key}>
                    <article className="rounded-3xl border border-indigo-100 bg-white/80 backdrop-blur p-8 sm:p-10">
                      <div className="flex flex-col gap-6 items-center">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-400 text-white">
                      <Icon fontSize="small" />
                    </span>
                        <h4 className="text-lg font-semibold text-slate-900">{t(`${glideKey}.title`)}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{t(`${glideKey}.desc`)}</p>
                      </div>
                    </article>
                  </SwiperSlide>
              ))}
            </Swiper>

            {/* Buttons + Indicator group (아래 배치) */}
            <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
              <button
                  ref={prevRef}
                  className="rounded-full border border-indigo-300 bg-white/80 backdrop-blur px-3 py-2 hover:bg-white transition-all duration-200"
              >
                ‹
              </button>

              {/* Swiper pagination dots */}
              <div
                  ref={paginationRef}
                  className="custom-pagination flex shrink-0 items-center justify-center !static !w-auto"
              />

              <button
                  ref={nextRef}
                  className="rounded-full border border-indigo-300 bg-white/80 backdrop-blur px-3 py-2 hover:bg-white transition-all duration-200"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
  );
}
