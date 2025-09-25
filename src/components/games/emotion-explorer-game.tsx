
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw, Lightbulb, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exercise, Child } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { saveGameSession } from '@/app/(main)/exercises/[slug]/actions';
import { useAudioPlayer } from '@/hooks/use-audio-player';

const emotions = [
    { emoji: '😊', name: 'Happy', copingStrategy: 'Share your smile with someone! What made you feel this way?' },
    { emoji: '😢', name: 'Sad', copingStrategy: 'It\'s okay to cry. Try drawing a picture of how you feel or cuddling a soft toy.' },
    { emoji: '😠', name: 'Angry', copingStrategy: 'Take a deep breath and count to five. It can help to stomp your feet or squeeze a pillow.' },
    { emoji: '😨', name: 'Scared', copingStrategy: 'Find a safe person like a parent or teacher and tell them you\'re scared. A big hug can help!' },
    { emoji: '🥳', name: 'Excited', copingStrategy: 'It\'s great to be excited! You can jump up and down or share your excitement with a friend.' },
    { emoji: '😮', name: 'Surprised', copingStrategy: 'Surprises can be fun or startling! Take a moment to understand what happened.' },
    { emoji: '😴', name: 'Tired', copingStrategy: 'Your body is telling you it needs rest. Try yawning and stretching, then find a cozy spot to relax.' },
    { emoji: '😳', name: 'Shy', copingStrategy: 'It\'s okay to feel shy. You can start with a small wave or smile, and join in when you feel ready.' },
];

function generatePuzzles() {
    const shuffledEmotions = [...emotions].sort(() => 0.5 - Math.random());
    return shuffledEmotions.map(emotion => {
        const options = [...emotions]
            .filter(e => e.name !== emotion.name)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
        options.push(emotion);
        return {
            target: emotion,
            options: options.sort(() => 0.5 - Math.random()),
        };
    });
}


export function EmotionExplorerGame({ 
    exercise,
    child,
    transcript,
    isListening
}: { 
    exercise: Exercise,
    child: Child,
    transcript?: string;
    isListening?: boolean;
}) {
    const { toast } = useToast();
    const [puzzles, setPuzzles] = useState(generatePuzzles);
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'question' | 'feedback'>('question');
    const { playAudio, isPlaying } = useAudioPlayer();

    const currentPuzzle = useMemo(() => puzzles[currentPuzzleIndex], [puzzles, currentPuzzleIndex]);
    const performance = Math.round((score / puzzles.length) * 100);
    
    const moveToNextStep = useCallback(() => {
        if (currentPuzzleIndex < puzzles.length - 1) {
            setCurrentPuzzleIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsCorrect(null);
            setGameState('question');
        } else {
            setIsComplete(true);
        }
    }, [currentPuzzleIndex, puzzles.length]);

    const handleSelect = useCallback((emotionName: string) => {
        if (gameState !== 'question') return;

        setSelectedOption(emotionName);
        const correct = emotionName === currentPuzzle.target.name;
        setIsCorrect(correct);
        if (correct) {
            setScore(s => s + 1);
            if (!isPlaying) playAudio('Correct!', 'en-US');
            setTimeout(() => {
                setGameState('feedback');
            }, 1000);
        } else {
            if (!isPlaying) playAudio('Oops, that was ' + currentPuzzle.target.name, 'en-US');
             setTimeout(() => {
                moveToNextStep();
            }, 2000); // Give more time to see the correct answer
        }
    }, [currentPuzzle, gameState, moveToNextStep, isPlaying, playAudio]);

    useEffect(() => {
        if (transcript && !isListening && gameState === 'question') {
            const heardEmotion = transcript.toLowerCase().trim().replace('.', '');
            const matchingEmotion = emotions.find(e => e.name.toLowerCase() === heardEmotion);

            if (matchingEmotion) {
                toast({
                    title: 'Voice Command Received',
                    description: `You said "${matchingEmotion.name}". Selecting it.`
                })
                handleSelect(matchingEmotion.name);
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Voice Command Not Recognized',
                    description: `Sorry, I didn't understand "${transcript}".`
                })
            }
        }
    }, [transcript, isListening, gameState, handleSelect, toast]);

     useEffect(() => {
        async function handleCompletion() {
            if (isComplete) {
                if (!isPlaying) playAudio('You\'re an emotion expert!', 'en-US');
                const result = await saveGameSession({ childId: child.id, exerciseId: exercise.id, score: performance, difficulty: 'Easy' });
                if (result.success) {
                    toast({ title: 'Progress Saved!', description: 'Your score has been recorded.' });
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not save your score.' });
                }
            }
        }
        handleCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isComplete, exercise.id, performance, toast, child.id]);


    const handleRestart = () => {
        setPuzzles(generatePuzzles());
        setCurrentPuzzleIndex(0);
        setSelectedOption(null);
        setIsCorrect(null);
        setIsComplete(false);
        setScore(0);
        setGameState('question');
    };
    
    if (isComplete) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Great Job!</h3>
                <p className="text-muted-foreground mb-4">You're an emotion expert!</p>
                <p className="text-xl font-bold mb-6">Your Score: {performance}%</p>
                <Button onClick={handleRestart}><RotateCcw className="mr-2 h-4 w-4" /> Play Again</Button>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>
                    {gameState === 'question' ? 'Which emotion is this? Match the face to the correct word.' : 'Here\'s a helpful tip!'}
                </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[350px] flex items-center justify-center">
                {gameState === 'question' ? (
                    <div className="flex flex-col items-center gap-8">
                        <div className="text-8xl">
                            {currentPuzzle.target.emoji}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            {currentPuzzle.options.map((emotion) => {
                                const isSelected = selectedOption === emotion.name;
                                const isTarget = emotion.name === currentPuzzle.target.name;
                                let variantClass = "bg-transparent";

                                if (selectedOption !== null) {
                                    if (isTarget) {
                                        variantClass = "bg-green-500/20 border-green-500";
                                    }
                                    if (isSelected && !isCorrect) {
                                        variantClass = "bg-destructive/20 border-destructive";
                                    }
                                }

                                return (
                                <Button
                                    key={emotion.name}
                                    variant="outline"
                                    className={cn("h-16 text-lg px-6 relative", variantClass)}
                                    onClick={() => handleSelect(emotion.name)}
                                    disabled={selectedOption !== null}
                                >
                                    {emotion.name}
                                    {selectedOption !== null && isSelected && !isCorrect && <XCircle className="h-5 w-5 absolute -top-2 -right-2 text-white bg-destructive rounded-full" />}
                                    {selectedOption !== null && isTarget && <CheckCircle className="h-5 w-5 absolute -top-2 -right-2 text-white bg-green-500 rounded-full" />}
                                </Button>
                            )})}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 text-center animate-in fade-in-50">
                        <div className="text-7xl">{currentPuzzle.target.emoji}</div>
                        <h3 className="text-2xl font-bold text-primary">{currentPuzzle.target.name}</h3>
                        <div className="flex items-start gap-2 p-4 bg-secondary rounded-lg">
                            <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                            <p className="text-muted-foreground">{currentPuzzle.target.copingStrategy}</p>
                        </div>
                        <Button onClick={moveToNextStep}>Continue</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
