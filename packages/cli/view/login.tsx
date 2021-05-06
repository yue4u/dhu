import React from "react";
import { render, Text, Box } from "ink";
import { saveUserInfo } from "@dhu/core";
import { useSteps, useStepInput, StepProps } from "./hooks/useSteps";

interface QuestionProps extends StepProps {
  question: Question;
  active: boolean;
  done: boolean;
  onSubmit(text: string): void;
}

function Question({ active, done, question, onSubmit }: QuestionProps) {
  const { text } = useStepInput({
    active,
    onSubmit,
  });

  if (active || done) {
    return (
      <Text>
        <Text color="yellow">{question.text} </Text>
        {question.hideInput ? "*".repeat(text.length) : text}
      </Text>
    );
  }

  return null;
}

interface Question {
  text: string;
  hideInput?: boolean;
}

function Questions({ questions }: { questions: Question[] }) {
  const { step, advance } = useSteps({
    stepData: questions,
    onFinish(data) {
      const [id, password] = data;
      saveUserInfo({ id, password });
    },
  });

  return (
    <Box flexDirection="column">
      {questions.map((q, index) => (
        <Question
          key={q.text}
          index={index}
          active={index === step}
          done={index < step}
          question={q}
          onSubmit={advance}
        />
      ))}
    </Box>
  );
}

export function renderLogin() {
  render(
    <Questions
      questions={[
        {
          text: "digicam id?",
        },
        {
          text: "password?",
          hideInput: true,
        },
      ]}
    />
  );
}
