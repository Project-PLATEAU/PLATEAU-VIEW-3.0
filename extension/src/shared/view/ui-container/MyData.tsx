import { useAtom } from "jotai";
import { useCallback } from "react";

import { useAddLayer } from "../../../prototypes/layers";
import { showMyDataModalAtom } from "../../../prototypes/view/states/app";
import { MY_DATA_LAYER } from "../../../prototypes/view-layers";
import MyDataModal from "../../ui-components/MyData";
import { UserDataItem } from "../../ui-components/MyData/types";
import { createRootLayerForLayerAtom } from "../../view-layers";

const MyData = () => {
  const [showMyDataModal, setShowMyDataModal] = useAtom(showMyDataModalAtom);
  const addLayer = useAddLayer();

  const onClose = useCallback(() => {
    setShowMyDataModal(false);
  }, [setShowMyDataModal]);

  const handleDataSetSubmit = (selectedItem: UserDataItem) => {
    addLayer(
      createRootLayerForLayerAtom({
        title: selectedItem.name ?? "",
        format: selectedItem?.format,
        type: MY_DATA_LAYER,
        url: selectedItem?.url,
        id: selectedItem?.dataID,
        csv: selectedItem?.additionalData?.data?.csv,
        layers: selectedItem?.layers,
      }),
      { autoSelect: false },
    );
    onClose?.();
  };

  return <MyDataModal onSubmit={handleDataSetSubmit} show={showMyDataModal} onClose={onClose} />;
};

export default MyData;
