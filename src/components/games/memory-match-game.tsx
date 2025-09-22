'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, Sparkles, Wand2, Star, CheckCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getAdaptedExercise, type FormState } from '@/app/(main)/exercises/[slug]/actions';
import type { Exercise } from '@/lib/types';
import { cn } from '@/lib/utils';
import { BrainCircuit, Puzzle, Bot, Mic, Fingerprint, HeartHandshake, BookOpen, Rocket, Gem } from 'lucide-react';

const icons = [BrainCircuit, Puzzle, Bot, Mic, Fingerprint, HeartHandshake, BookOpen, Rocket, Gem, Star];
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

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Get AI Adaptation
        </Button>
    );
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
                <Star className="h-8 w-8 text-secondary-foreground/50" />
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

export function MemoryMatchGame({ exercise }: { exercise: Exercise }) {
    const [cards, setCards] = useState<MemoryCard[]>(createBoard());
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [attempts, setAttempts] = useState(0);
    const [difficulty, setDifficulty] = useState('Medium');
    const [isComplete, setIsComplete] = useState(false);

    const initialState: FormState = null;
    const [state, formAction] = useFormState(getAdaptedExercise, initialState);
    
    const performance = useMemo(() => {
        if (attempts === 0) return 100;
        const baseScore = Math.max(0, 100 - (attempts - icons.length) * 5);
        return baseScore;
    }, [attempts]);


    useEffect(() => {
        if (flippedCards.length === 2) {
            const [firstId, secondId] = flippedCards;
            setAttempts(prev => prev + 1);
            if (cards[firstId].symbol === cards[secondId].symbol) {
                setCards(prev => prev.map(card =>
                    card.symbol === cards[firstId].symbol ? { ...card, isMatched: true } : card
                ));
            }
            setTimeout(() => setFlippedCards([]), 1000);
        }
    }, [flippedCards, cards]);

    useEffect(() => {
        if(cards.every(c => c.isMatched)) {
            setIsComplete(true);
        }
    }, [cards]);
    
    useEffect(() => {
        if (state?.result?.newDifficulty) {
            setDifficulty(state.result.newDifficulty);
        }
    }, [state]);

    const handleCardClick = (id: number) => {
        if (flippedCards.length < 2 && !cards[id].isFlipped && !isComplete) {
            setCards(prev => prev.map(card => card.id === id ? { ...card, isFlipped: true } : card));
            setFlippedCards(prev => [...prev, id]);
        }
    };
    
    const handleRestart = () => {
        setCards(createBoard());
        setFlippedCards([]);
        setAttempts(0);
        setIsComplete(false);
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Memory Board</span>
                        <Badge>{difficulty}</Badge>
                    </CardTitle>
                    <CardDescription>Match all the pairs! Attempts: {attempts}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isComplete ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-background rounded-lg p-8 text-center">
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
                        <div className="grid grid-cols-5 gap-4 [perspective:1000px]">
                            {cards.map(card => (
                                <MemoryCardComponent key={card.id} card={card} onCardClick={handleCardClick} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI Personalization
                    </CardTitle>
                    <CardDescription>The AI will adjust the next exercise based on the performance score.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!isComplete ? (
                         <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed">
                             <p className="text-muted-foreground">Complete the game to see AI results</p>
                         </div>
                    ) : state?.result ? (
                        <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle>New Recommendation: {state.result.newDifficulty}</AlertTitle>
                            <AlertDescription>{state.result.reasoning}</AlertDescription>
                        </Alert>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed p-4 text-center">
                            <p className="text-muted-foreground font-semibold mb-4">Ready to adapt?</p>
                            <p className="text-muted-foreground text-sm mb-4">Submit your performance score of {performance}% to get a personalized recommendation for your next game.</p>
                             <form action={formAction}>
                                <input type="hidden" name="exerciseType" value={exercise.title} />
                                <input type="hidden" name="currentDifficulty" value={difficulty} />
                                <input type="hidden" name="userPerformance" value={performance} />
                                <SubmitButton />
                            </form>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
