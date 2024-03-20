import GroupsList from "@reearth-cms/components/molecules/Model/ModelsList/GroupsList";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";
import { Group } from "@reearth-cms/components/molecules/Schema/types";

type Props = {
  title: string;
  collapsed?: boolean;
  selectedKey?: string;
  groups?: Group[];
  open: boolean;
  onModalOpen: () => void;
  onGroupKeyCheck: (key: string, ignoredKey?: string) => Promise<boolean>;
  onClose: () => void;
  onCreate: (data: { name: string; description: string; key: string }) => Promise<void>;
  onGroupSelect?: (groupId: string) => void;
};

const Groups: React.FC<Props> = ({
  collapsed,
  selectedKey,
  groups,
  open,
  onModalOpen,
  onGroupKeyCheck,
  onClose,
  onCreate,
  onGroupSelect,
}) => {
  return (
    <>
      <GroupsList
        selectedKey={selectedKey}
        groups={groups}
        collapsed={collapsed}
        onGroupSelect={onGroupSelect}
        onModalOpen={onModalOpen}
      />
      <FormModal
        open={open}
        onClose={onClose}
        onCreate={onCreate}
        onKeyCheck={onGroupKeyCheck}
        isModel={false}
      />
    </>
  );
};

export default Groups;
