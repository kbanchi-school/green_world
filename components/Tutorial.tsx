import React, { useState, useLayoutEffect, useRef } from 'react';
import { tutorialSteps } from '../tutorialContent';
import { Button } from './Button';

interface TutorialProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ step, onNext, onSkip }) => {
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [tooltipRect, setTooltipRect] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = tutorialSteps[step];
  if (!currentStep) return null;

  useLayoutEffect(() => {
    setElementRect(null);

    const selector = currentStep.selector;

    const updateRect = () => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        let newRect: DOMRect;
        const computedStyle = window.getComputedStyle(element);

        if (computedStyle.display === 'contents' && element.children.length > 0) {
            const firstRect = element.children[0].getBoundingClientRect();
            let top = firstRect.top;
            let bottom = firstRect.bottom;
            let left = firstRect.left;
            let right = firstRect.right;

            for (let i = 1; i < element.children.length; i++) {
                const childRect = element.children[i].getBoundingClientRect();
                top = Math.min(top, childRect.top);
                bottom = Math.max(bottom, childRect.bottom);
                left = Math.min(left, childRect.left);
                right = Math.max(right, childRect.right);
            }
            newRect = new DOMRect(left, top, right - left, bottom - top);
        } else {
            newRect = element.getBoundingClientRect();
        }

        setElementRect(prevRect => {
          if (
            !prevRect ||
            prevRect.top !== newRect.top ||
            prevRect.left !== newRect.left ||
            prevRect.width !== newRect.width ||
            prevRect.height !== newRect.height
          ) {
            return newRect;
          }
          return prevRect;
        });
      }
    };

    const intervalId = setInterval(updateRect, 50);
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      updateRect();
    }, 500);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [currentStep.selector, step]);

  useLayoutEffect(() => {
    const updateTooltipSize = () => {
      if (tooltipRef.current) {
        const { width, height } = tooltipRef.current.getBoundingClientRect();
        if (width !== tooltipRect.width || height !== tooltipRect.height) {
          setTooltipRect({ width, height });
        }
      }
    };
    updateTooltipSize();
    window.addEventListener('resize', updateTooltipSize);
    return () => window.removeEventListener('resize', updateTooltipSize);
  }, [step, tooltipRect.width, tooltipRect.height]);

  
  const tooltipPositionStyle = (): React.CSSProperties => {
    if (!elementRect || tooltipRect.width === 0) {
      return { opacity: 0, pointerEvents: 'none' };
    }
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const PADDING = 16;
    
    const baseStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 10000,
        transition: 'all 0.3s ease-in-out',
        opacity: 1,
    };

    let top = 0, left = 0;
    
    switch (currentStep.position) {
        case 'top':
            top = elementRect.top - PADDING - tooltipRect.height;
            left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
            break;
        case 'bottom':
            top = elementRect.bottom + PADDING;
            left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
            break;
        case 'left':
            top = elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
            left = elementRect.left - PADDING - tooltipRect.width;
            break;
        case 'right':
             top = elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
             left = elementRect.right + PADDING;
             break;
        case 'center':
        default:
            top = vh / 2 - tooltipRect.height / 2;
            left = vw / 2 - tooltipRect.width / 2;
            break;
    }
     
    if (top < PADDING) {
        if (elementRect.bottom + PADDING + tooltipRect.height < vh - PADDING) {
            top = elementRect.bottom + PADDING;
        } else {
            top = PADDING;
        }
    }
    if (top + tooltipRect.height > vh - PADDING) {
        if (elementRect.top - PADDING - tooltipRect.height > PADDING) {
            top = elementRect.top - PADDING - tooltipRect.height;
        } else {
             top = vh - PADDING - tooltipRect.height;
        }
    }
    if (left < PADDING) {
        left = PADDING;
    }
    if (left + tooltipRect.width > vw - PADDING) {
        left = vw - PADDING - tooltipRect.width;
    }

    return { ...baseStyle, top: `${top}px`, left: `${left}px` };
  };

  const renderOverlay = () => {
    const PADDING = 8;
    const baseOverlayClass = "fixed bg-black bg-opacity-70 z-[9998] transition-all duration-300 ease-in-out";

    if (!elementRect) {
        return <div className="fixed inset-0 bg-black bg-opacity-70 z-[9998]" />;
    }

    const styles: { [key: string]: React.CSSProperties } = {
        top: {
            top: 0,
            left: 0,
            right: 0,
            height: elementRect.top - PADDING,
        },
        bottom: {
            top: elementRect.bottom + PADDING,
            left: 0,
            right: 0,
            bottom: 0,
        },
        left: {
            top: elementRect.top - PADDING,
            left: 0,
            width: elementRect.left - PADDING,
            height: elementRect.height + PADDING * 2,
        },
        right: {
            top: elementRect.top - PADDING,
            left: elementRect.right + PADDING,
            right: 0,
            height: elementRect.height + PADDING * 2,
        }
    };
     const borderStyle: React.CSSProperties = {
        position: 'fixed',
        left: `${elementRect.left - PADDING}px`,
        top: `${elementRect.top - PADDING}px`,
        width: `${elementRect.width + PADDING * 2}px`,
        height: `${elementRect.height + PADDING * 2}px`,
        border: '2px solid #22d3ee',
        borderRadius: '8px',
        zIndex: 9998,
        pointerEvents: 'none',
        transition: 'all 0.3s ease-in-out',
    };

    return (
        <>
            <div className={baseOverlayClass} style={styles.top} />
            <div className={baseOverlayClass} style={styles.bottom} />
            <div className={baseOverlayClass} style={styles.left} />
            <div className={baseOverlayClass} style={styles.right} />
            <div style={borderStyle} />
        </>
    );
};

  return (
    <>
      {renderOverlay()}
      <div ref={tooltipRef} style={tooltipPositionStyle()} className="animate-fade-in">
        <div className="bg-slate-800 p-4 rounded-lg shadow-2xl border border-slate-600 w-full max-w-[calc(100vw-32px)] sm:w-72">
            <h3 className="text-lg font-bold text-cyan-300 mb-2">{currentStep.title}</h3>
            <p className="text-slate-300 text-sm mb-4">{currentStep.text}</p>
            <div className="flex justify-between items-center">
                <Button onClick={onSkip} className="bg-gray-600 hover:bg-gray-500 text-xs px-2 py-0.5">スキップ</Button>
                {!currentStep.isActionDriven && (
                    <Button onClick={onNext} className="text-sm px-3 py-1">次へ</Button>
                )}
            </div>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
    `}</style>
    </>
  );
};

export default Tutorial;