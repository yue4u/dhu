import { useEffect, useState } from "react";
import { useApp, useInput } from "ink";

export function useSteps<T extends unknown[], D extends unknown[]>({
  onFinish,
  stepData,
}: {
  stepData: T;
  onFinish: (data: D) => void | Promise<void>;
}) {
  const { exit } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<D[number][]>([]);

  useEffect(() => {
    (async () => {
      if (step < stepData.length) return;
      await onFinish(answers as D);
      exit();
    })();
  }, [step, exit, stepData]);
  const advance = (data: D[number]) => {
    setAnswers([...answers, data]);
    setStep(step + 1);
  };

  return {
    step,
    advance,
  };
}

export function useStepInput({
  active,
  onSubmit,
}: {
  active: boolean;
  onSubmit(val: unknown): Promise<void> | void;
}) {
  const [text, setText] = useState("");

  useInput(async (input, key) => {
    if (!active) return;
    if (key.return) {
      await onSubmit(text);
      return;
    }
    if (key.delete) {
      setText(text.slice(0, text.length - 1));
    } else {
      setText(text + input);
    }
  });
  return {
    text,
    setText,
  };
}

export interface StepProps {
  index: number;
  active: boolean;
  done: boolean;
}
