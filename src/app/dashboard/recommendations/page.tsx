'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getRecommendations, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BrainCircuit, Lightbulb, Loader, ServerCrash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState: FormState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <SparklesIcon className="mr-2 h-4 w-4" />
          Get Recommendations
        </>
      )}
    </Button>
  );
}

export default function RecommendationsPage() {
  const [formState, formAction] = useFormState(getRecommendations, initialState);
  const [attendance, setAttendance] = useState([0.9]);
  const { toast } = useToast();

  useEffect(() => {
    if (formState.message === 'success') {
       toast({
        title: "Recommendations Generated",
        description: "Your personalized training plan is ready.",
      });
    } else if (formState.message && formState.message !== 'success' && formState.message !== '') {
       toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: formState.message,
      });
    }
  }, [formState, toast]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            AI Coach
          </h1>
          <p className="text-muted-foreground">
            Generate personalized training recommendations for athletes.
          </p>
        </div>

        <form action={formAction}>
          <Card>
            <CardHeader>
              <CardTitle>Athlete Information</CardTitle>
              <CardDescription>
                Fill in the details below to receive AI-powered advice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="athleteId">Athlete ID</Label>
                <Input id="athleteId" name="athleteId" placeholder="e.g., D-12345" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="performanceData">Performance Data (JSON)</Label>
                <Textarea
                  id="performanceData"
                  name="performanceData"
                  placeholder='{ "sprint_100m": "11.5s", "long_jump": "7.2m", "last_competition_result": "2nd" }'
                  className="min-h-32 font-code"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendanceRate">Attendance Rate: {attendance[0] * 100}%</Label>
                <Input type="hidden" name="attendanceRate" value={attendance[0]} />
                <Slider
                  id="attendanceRate"
                  min={0}
                  max={1}
                  step={0.01}
                  value={attendance}
                  onValueChange={setAttendance}
                />
              </div>
              <div className="space-y-4">
                 <Label>Additional Preferences</Label>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="includeDietaryTips" name="includeDietaryTips" />
                    <Label htmlFor="includeDietaryTips" className="font-normal">Include Dietary Tips</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="includeMentalWellnessTips" name="includeMentalWellnessTips" />
                    <Label htmlFor="includeMentalWellnessTips" className="font-normal">Include Mental Wellness Tips</Label>
                 </div>
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </Card>
        </form>
      </div>

      <div className="space-y-8">
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="text-primary"/>
                Your Personalized Plan
            </CardTitle>
            <CardDescription>
              Recommendations will appear here once generated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formState.message === 'success' && formState.recommendations ? (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-muted p-4">
                {formState.recommendations}
              </div>
            ) : (
                 <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-96">
                    <Lightbulb className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Awaiting Input</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Fill out the form to get your recommendations.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.9 4.2-4.2 1.9 4.2 1.9L12 15l1.9-4.2 4.2-1.9-4.2-1.9L12 3Z" />
      <path d="M5 12s2.5-1.5 5-3.5A2.2 2.2 0 0 1 14.5 9c2.5 2 5 3.5 5 3.5s-2.5 1.5-5 3.5A2.2 2.2 0 0 1 9.5 15c-2.5-2-5-3.5-5-3.5Z" />
      <path d="M19 12s-2.5 1.5-5 3.5" />
    </svg>
  );
}
