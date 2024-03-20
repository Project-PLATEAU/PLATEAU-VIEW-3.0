import { type Meta, type StoryObj } from "@storybook/react";
import { FC } from "react";

import { MultipleSelectSearch } from "./MultipleSelectSearch";

const meta: Meta<typeof MultipleSelectSearch> = {
  title: "MultipleSelectSearch",
  component: MultipleSelectSearch,
};

export default meta;

type Story = StoryObj<typeof MultipleSelectSearch>;

const options = [
  {
    label: "hello",
    value: "1",
  },
  {
    label: "hell2",
    value: "2",
  },
  {
    label: "hello3",
    value: "3",
  },
  {
    label: "hello4",
    value: "4",
  },
  {
    label: "hello5",
    value: "5",
  },
  {
    label: "hello6",
    value: "6",
  },
  {
    label: "hello7",
    value: "7",
  },
  {
    label: "hello8",
    value: "8",
  },
  {
    label: "hello9",
    value: "9",
  },
  {
    label: "hello10",
    value: "10",
  },
];

const Component: FC<{ position?: "top" | "bottom" }> = ({ position }) => {
  return (
    <div style={{ width: 300 }}>
      <MultipleSelectSearch
        title="名称"
        placeholder="Please enter keyword"
        options={options}
        position={position}
        onChange={console.log}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <Component />,
};

export const Top: Story = {
  render: () => <Component position="top" />,
};
