import CommentsPanelMolecule from "@reearth-cms/components/molecules/Common/CommentsPanel";
import {
  Comment,
  RefetchQueries,
} from "@reearth-cms/components/molecules/Common/CommentsPanel/types";

import useHooks from "./hooks";

type Props = {
  emptyText?: string;
  threadId?: string;
  comments?: Comment[];
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
  refetchQueries: RefetchQueries;
};

const CommentsPanel: React.FC<Props> = ({
  emptyText,
  threadId,
  comments,
  collapsed,
  onCollapse,
  refetchQueries,
}) => {
  const { me, handleCommentCreate, handleCommentUpdate, handleCommentDelete } = useHooks({
    threadId,
    refetchQueries,
  });

  return (
    <CommentsPanelMolecule
      me={me}
      emptyText={emptyText}
      comments={comments}
      collapsed={collapsed}
      onCollapse={onCollapse}
      onCommentCreate={handleCommentCreate}
      onCommentUpdate={handleCommentUpdate}
      onCommentDelete={handleCommentDelete}
    />
  );
};

export default CommentsPanel;
