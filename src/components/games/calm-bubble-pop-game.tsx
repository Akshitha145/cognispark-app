
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Exercise, Child } from '@/lib/types';
import { BubbleIcon } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Bubble = {
  id: number;
  x: number;
  size: number;
  duration: number;
  color: string;
};

const bubbleColors = [
    'hsl(var(--primary) / 0.4)',
    'hsl(var(--accent) / 0.4)',
    '#8b5cf666', // voilet-500 with 40% opacity
    '#ec489966', // pink-500 with 40% opacity
    '#22d3ee66', // cyan-400 with 40% opacity
];
const popSoundUrl = 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-zapsplat/zapsplat_multimedia_button_click_fast_short_soft_001_63852.mp3';


let bubbleId = 0;

export function CalmBubblePopGame({ exercise, child }: { exercise: Exercise; child: Child }) {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);

    useEffect(() => {
        const createBubble = () => {
            const newBubble: Bubble = {
                id: bubbleId++,
                x: Math.random() * 90, // % from left
                size: Math.random() * 40 + 30, // 30px to 70px
                duration: Math.random() * 5 + 5, // 5 to 10 seconds
                color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
            };
            setBubbles(prev => [...prev, newBubble]);
        };

        const interval = setInterval(createBubble, 1500); // New bubble every 1.5s

        return () => clearInterval(interval);
    }, []);

    const handlePop = (id: number) => {
        setBubbles(prev => prev.filter(bubble => bubble.id !== id));
        new Audio(popSoundUrl).play().catch(e => console.error("Error playing sound", e));
    };

    return (
        <Card className="relative overflow-hidden">
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>
                    A calm, relaxing space. Tap the bubbles to pop them. There's no score, just enjoy the moment.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] w-full p-0 border-t">
                <AnimatePresence>
                    {bubbles.map(bubble => (
                        <motion.div
                            key={bubble.id}
                            className="absolute bottom-0"
                            style={{
                                left: `${bubble.x}%`,
                                width: bubble.size,
                                height: bubble.size,
                            }}
                            initial={{ y: 0, opacity: 1 }}
                            animate={{ y: -450 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: bubble.duration, ease: "linear" }}
                            onAnimationComplete={() => setBubbles(prev => prev.filter(b => b.id !== bubble.id))}
                        >
                            <button onClick={() => handlePop(bubble.id)} className="w-full h-full">
                               <BubbleIcon style={{ color: bubble.color }} className="w-full h-full" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                 <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <p className="text-muted-foreground/30 text-lg">Just relax and pop...</p>
                </div>
            </CardContent>
             <div className="absolute bottom-4 right-4">
                <Button asChild>
                    <Link href="/child">Back to Games</Link>
                </Button>
            </div>
        </Card>
    );
}
