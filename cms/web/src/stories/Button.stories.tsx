import type { Meta, StoryObj } from "@storybook/react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";

const meta = {
  title: "reearth-cms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["default", "primary", "secondary", "link"],
    },
    danger: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Hello",
    type: "default",
    danger: false,
    disabled: false,
  },
};

export const IconButton: Story = {
  args: {
    children: "Hello",
    type: "default",
    danger: false,
    disabled: false,
    icon: <Icon icon="plus" />,
  },
};
