

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BrainCircuit, Puzzle, CheckCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Exercise, Child } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { saveGameSession } from '@/app/(main)/exercises/[slug]/actions';
import { useToast } from '@/hooks/use-toast';

const icons = [BrainCircuit, Puzzle];
const cardSymbols = [...icons, ...icons].sort(() => Math.random() - 0.5);

type MemoryCard = {
  id: number;
  symbol: React.ElementType;
  isFlipped: boolean;
  isMatched: boolean;
};

function createBoard(): MemoryCard[] {
    return cardSymbols.map((symbol, index) => ({
        id: index,
        symbol: symbol,
        isFlipped: false,
        isMatched: false,
    }));
}

function MemoryCardComponent({ card, onCardClick }: { card: MemoryCard, onCardClick: (id: number) => void }) {
    const CardSymbol = card.symbol;
    return (
        <div 
            className={cn(
                "rounded-lg aspect-square flex items-center justify-center cursor-pointer transition-transform duration-300 [transform-style:preserve-3d]",
                card.isFlipped && "[transform:rotateY(180deg)]"
            )}
            onClick={() => onCardClick(card.id)}
        >
            <div className="absolute w-full h-full bg-secondary rounded-lg flex items-center justify-center [backface-visibility:hidden]">
                <Puzzle className="h-8 w-8 text-secondary-foreground/50" />
            </div>
            <div 
                className={cn(
                    "w-full h-full rounded-lg flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    card.isMatched ? "bg-green-100 dark:bg-green-900/50" : "bg-primary/10"
                )}
            >
                <CardSymbol className={cn("h-10 w-10", card.isMatched ? "text-green-500" : "text-primary")} />
            </div>
        </div>
    );
}

export function MemoryMatchGame({ exercise, child }: { exercise: Exercise, child: Child }) {
    const [cards, setCards] = useState<MemoryCard[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [attempts, setAttempts] = useState(0);
    const [difficulty, setDifficulty] = useState('Easy');
    const [isComplete, setIsComplete] = useState(false);
    const { playAudio, isPlaying } = useAudioPlayer();
    const [isMounted, setIsMounted] = useState(false);
    const { toast } = useToast();

    const performance = useMemo(() => {
        if (isComplete) {
            const baseScore = Math.max(0, 100 - (attempts - icons.length) * 10);
            return baseScore;
        }
        return 0;
    }, [attempts, isComplete]);


    useEffect(() => {
        setCards(createBoard());
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || flippedCards.length !== 2) return;

        const timer = setTimeout(() => {
            setAttempts(prev => prev + 1);
            const [firstId, secondId] = flippedCards;

            setCards(currentCards => {
                const firstCard = currentCards.find(c => c.id === firstId);
                const secondCard = currentCards.find(c => c.id === secondId);

                if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
                     if (!isPlaying) playAudio('You found a match!', 'en-US');
                     return currentCards.map(card =>
                        card.symbol === firstCard.symbol ? { ...card, isMatched: true, isFlipped: true } : card
                    );
                } else {
                    if (!isPlaying) playAudio('Oops, try again!', 'en-US');
                    return currentCards.map(card =>
                        (card.id === firstId || card.id === secondId) ? { ...card, isFlipped: false } : card
                    );
                }
            });
            setFlippedCards([]);

        }, 1000);

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flippedCards, isMounted, playAudio, isPlaying]);

    useEffect(() => {
        if (isMounted && cards.length > 0 && cards.every(c => c.isMatched)) {
            if (!isComplete) {
                 if (!isPlaying) playAudio('Great Job! You completed the game!', 'en-US');
                setIsComplete(true);
            }
        }
    }, [cards, isMounted, isPlaying, playAudio, isComplete]);
    
    useEffect(() => {
        async function saveScore() {
            if (isComplete) {
                const finalScore = Math.max(0, 100 - (attempts - icons.length) * 10);
                const result = await saveGameSession({ childId: child.id, exerciseId: exercise.id, score: finalScore, difficulty });
                if (result.success) {
                    toast({ title: 'Progress Saved!', description: 'Your score has been recorded.' });
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not save your score.' });
                }
            }
        }
        saveScore();
    }, [isComplete, attempts, child.id, exercise.id, difficulty, toast]);
    

    const handleCardClick = (id: number) => {
        const card = cards.find(c => c.id === id);
        if (flippedCards.length === 2 || (card && (card.isFlipped || card.isMatched)) || isComplete) {
            return;
        }

        setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));
        setFlippedCards(prev => [...prev, id]);
    };
    
    const handleRestart = () => {
        setCards(createBoard());
        setFlippedCards([]);
        setAttempts(0);
        setIsComplete(false);
    }
    
    if (!isMounted) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Memory Board</span>
                        <Badge>{difficulty}</Badge>
                    </CardTitle>
                    <CardDescription>Loading game...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-center h-full min-h-[220px]">
                        <p>Loading...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Memory Board</span>
                    <Badge>{difficulty}</Badge>
                </CardTitle>
                <CardDescription>Match all the pairs! Attempts: {attempts}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isComplete ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-background rounded-lg p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Great Job!</h3>
                        <p className="text-muted-foreground mb-4">You completed the game in {attempts} attempts.</p>
                        <p className="text-xl font-bold mb-6">Your Score: {performance}%</p>
                        <Button onClick={handleRestart}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Play Again
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto [perspective:1000px]">
                        {cards.map(card => (
                            <MemoryCardComponent key={card.id} card={card} onCardClick={handleCardClick} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
