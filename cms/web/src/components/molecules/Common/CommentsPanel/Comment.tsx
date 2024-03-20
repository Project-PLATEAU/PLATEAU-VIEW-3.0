import styled from "@emotion/styled";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Badge from "@reearth-cms/components/atoms/Badge";
import AntDComment from "@reearth-cms/components/atoms/Comment";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import { dateTimeFormat } from "@reearth-cms/utils/format";

const { TextArea } = Input;

type Props = {
  me?: User;
  comment: Comment;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
};

const CommentMolecule: React.FC<Props> = ({ me, comment, onCommentUpdate, onCommentDelete }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [value, setValue] = useState(comment.content);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);

  useEffect(() => {
    setValue(comment.content);
  }, [comment.content, showEditor, setValue]);

  const handleSubmit = useCallback(async () => {
    try {
      await onCommentUpdate?.(comment.id, value);
    } catch (info) {
      console.log("Validate Failed:", info);
    } finally {
      setShowEditor(false);
    }
  }, [value, comment.id, onCommentUpdate]);

  const fromNow = useMemo(
    () => moment(comment.createdAt?.toString()).fromNow(),
    [comment.createdAt],
  );

  return (
    <StyledComment
      actions={
        me?.id === comment.author.id
          ? [
              <Icon key="delete" icon="delete" onClick={() => onCommentDelete(comment.id)} />,
              showEditor ? (
                <Icon key="edit" icon="check" onClick={handleSubmit} />
              ) : (
                <Icon key="edit" icon="edit" onClick={() => setShowEditor(true)} />
              ),
            ]
          : []
      }
      author={<a> {comment.author.name}</a>}
      avatar={
        comment.author.type === "Integration" ? (
          <Badge count={<StyledIcon icon="api" size={8} color="#BFBFBF" />} offset={[0, 24]}>
            <UserAvatar
              username={comment.author.name}
              anonymous={comment.author.name === "Anonymous"}
            />
          </Badge>
        ) : (
          <UserAvatar
            username={comment.author.name}
            anonymous={comment.author.name === "Anonymous"}
          />
        )
      }
      content={
        <>
          <Form.Item hidden={!showEditor}>
            <TextArea onChange={handleChange} value={value} rows={4} maxLength={1000} showCount />
          </Form.Item>
          <div hidden={showEditor}>
            <ReactMarkdown
              components={{
                a(props) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { node, ...rest } = props;
                  return <a target="_blank" {...rest} />;
                },
              }}
              remarkPlugins={[remarkGfm]}>
              {comment.content}
            </ReactMarkdown>
          </div>
        </>
      }
      datetime={
        comment.createdAt && (
          <Tooltip title={dateTimeFormat(comment.createdAt)}>
            <span>{fromNow}</span>
          </Tooltip>
        )
      }
    />
  );
};

const StyledComment = styled(AntDComment)`
  .ant-comment-actions {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0;
  }
`;

const StyledIcon = styled(Icon)`
  border-radius: 50%;
  background-color: #f0f0f0;
  padding: 3px;
`;

export default CommentMolecule;
