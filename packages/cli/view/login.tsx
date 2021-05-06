import React, { useEffect, useState } from "react";
import { render, Text, Box, useApp, useInput } from "ink";
import { produce } from "immer";
import { saveUserInfo } from "@dhu/core";

interface QuestionProps {
  question: Question;
  active: boolean;
  done: boolean;
  updateQuestion(text: string): void;
}

function Question({ active, done, question, updateQuestion }: QuestionProps) {
  const [text, setText] = useState("");

  useInput((input, key) => {
    if (!active) return;
    if (key.return) {
      updateQuestion(text);
      return;
    }
    if (key.delete) {
      setText(text.slice(0, text.length - 1));
    } else {
      setText(text + input);
    }
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
  answer?: string;
}

function Questions(props: { questions: Question[] }) {
  const { exit } = useApp();
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState(props.questions);

  useEffect(() => {
    if (step != props.questions.length) return;
    const [{ answer: id }, { answer: password }] = questions;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    saveUserInfo({ id: id!, password: password! });
    exit();
  }, [step, exit]);

  const updateQuestion = (answer: Question["text"]) => {
    setQuestions(
      produce(questions, (questions) => {
        questions[step].answer = answer;
      })
    );
    setStep(step + 1);
  };

  return (
    <Box flexDirection="column">
      {questions.map((q, index) => (
        <Question
          key={q.text}
          active={index === step}
          done={index < step}
          question={q}
          updateQuestion={updateQuestion}
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
