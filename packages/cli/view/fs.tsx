import React, { useEffect, useState } from "react";
import { render, Box, Text, Newline, useApp } from "ink";
import Spinner from "ink-spinner";
import SelectInput from "ink-select-input";
import chalk, { Chalk } from "chalk";
import {
  fillFS,
  FS,
  FSFormAnswers,
  FSQuestionSchema,
  FS_QUESTIONS,
  getFS,
} from "@dhu/core";
import { useSteps, useStepInput, StepProps } from "./hooks/useSteps";
import { LoginContext } from "@dhu/core/login";

const map: Record<string, Chalk> = {
  回答済: chalk.green,
  未回答: chalk.cyan,
  "*": chalk,
};

function QuestionItem({
  question,
  onSubmit,
  index,
  active,
}: {
  question: FSQuestionSchema;
  onSubmit(index: number): void;
} & StepProps) {
  const { text } = useStepInput({
    active: active && question.type === "input",
    onSubmit,
  });
  if (!active) {
    return null;
  }

  return (
    <Box flexDirection="column">
      <Text color="yellow">
        {index}) {question.text}
      </Text>
      <Newline />
      {question.type === "select" ? (
        <SelectInput
          items={question.options}
          onSelect={(item) => onSubmit(item.value)}
        />
      ) : (
        <Text>
          {"> "}
          {text}
        </Text>
      )}
    </Box>
  );
}

function WriteFS({
  ctx,
  questions,
}: {
  ctx: LoginContext;
  questions: FSQuestionSchema[];
}) {
  const [FSList, setFSList] = useState<FS[] | null>(null);
  const { exit } = useApp();
  useEffect(() => {
    (async () => {
      setFSList(await getFS(ctx));
    })();
  }, []);

  useEffect(() => {
    if (!FSList) return;
    if (FSList.length) return;
    exit();
  }, [FSList]);

  const { step, advance } = useSteps<
    FSQuestionSchema[],
    [number, ...FSFormAnswers]
  >({
    onFinish: async ([fsIndex, ...answers]) => {
      const result = await fillFS(ctx.page, fsIndex, answers);
      console.log({ result });
    },
    stepData: questions,
  });

  if (!FSList) {
    return (
      <Text>
        <Spinner />
        fetching data
      </Text>
    );
  }

  if (!FSList.length) {
    return <Text color="green">No unfilled FS</Text>;
  }

  const allQuestions: FSQuestionSchema[] = [
    {
      type: "select",
      text: "FS",
      options: FSList.map((fs, index) => {
        return {
          label: fs.title,
          value: index,
        };
      }),
    },
    ...questions,
  ];

  return (
    <Box flexDirection="column">
      {allQuestions.map((q, index) => (
        <QuestionItem
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

export const renderFS = {
  async write(ctx: LoginContext) {
    return render(
      <WriteFS ctx={ctx} questions={[...FS_QUESTIONS] as FSQuestionSchema[]} />
    ).waitUntilExit();
  },
  list(data: FS[]) {
    data.forEach((row) => {
      const color = map[row.status] ?? map["*"];
      console.log(
        `${color(row.status.padEnd(4))} ${chalk.magenta(
          row.deadline
        )} ${chalk.gray(row.title)}`
      );
    });
  },
};
