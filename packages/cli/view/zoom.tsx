import React, { useMemo, useState } from "react";
import { render, Text } from "ink";
import SelectInput from "ink-select-input";
import { zoom, ZoomInfo } from "@dhu/core";
import { spawn } from "child_process";

const getCmd = () => {
  const map: Partial<Record<typeof process["platform"], string>> = {
    darwin: "open",
    linux: "xdg-open",
  };
  const cmd = map[process.platform];
  if (cmd) return cmd;
  console.error(`platform ${process.platform} is no supported`);
  process.exit(1);
};

const Zoom = ({
  openCommand,
  meetings,
}: {
  openCommand: string;
  meetings: ZoomInfo[];
}) => {
  const [message, setMessage] = useState("");
  const items = useMemo(() => {
    return meetings.map((m) => ({
      label: `${m.title} meeting id: ${m.meetingId}`,
      value: m,
    }));
  }, []);

  const handleSelect = async (item: typeof items[number]) => {
    const url = zoom.getUrl(item.value);
    setMessage(`opening ${item.label}, url=${url}`);
    spawn(openCommand, [url], {
      stdio: "ignore",
      detached: true,
    });
    process.exit();
  };

  if (message) {
    return <Text>{message}</Text>;
  }

  return <SelectInput items={items} onSelect={handleSelect} />;
};

export async function renderZoom() {
  const cmd = getCmd();
  const meetings = await zoom.listToday();
  if (!meetings.length) {
    console.log(`no meetings today!`);
    return;
  }

  render(<Zoom openCommand={cmd} meetings={meetings} />);
}
