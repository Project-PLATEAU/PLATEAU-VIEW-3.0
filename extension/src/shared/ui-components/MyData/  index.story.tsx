import { Meta, StoryObj } from "@storybook/react";
import { FC } from "react";

import { useAddLayer } from "../../../prototypes/layers";
import { MY_DATA_LAYER } from "../../../prototypes/view-layers";
import { createRootLayerForLayerAtom } from "../../view-layers/rootLayer";

import MyData from ".";

const meta: Meta<typeof MyData> = {
  title: "MyData",
  component: MyData,
};

export default meta;
type Story = StoryObj<typeof MyData>;

const Component: FC = () => {
  const addLayer = useAddLayer();

  const handleAddLayer = () => {
    return addLayer(
      createRootLayerForLayerAtom({
        title: "sample.csv",
        format: "CSV",
        type: MY_DATA_LAYER,
        url: "sample.csv",
      }),
      { autoSelect: false },
    );
  };

  return <MyData show={true} onClose={console.log} onSubmit={handleAddLayer} />;
};

export const Default: Story = {
  render: () => <Component />,
};
