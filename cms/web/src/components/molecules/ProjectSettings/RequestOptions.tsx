import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { useT } from "@reearth-cms/i18n";

import { Project, Role } from "../Workspace/types";

export type RequestOptionsData = {
  id: string;
  role: string;
  needRequest: JSX.Element;
};

export type Props = {
  project?: Project;
  onProjectRequestRolesUpdate: (role?: Role[] | null) => Promise<void>;
};

const ProjectRequestOptions: React.FC<Props> = ({ project, onProjectRequestRolesUpdate }) => {
  const [requestRoles, setRequestRoles] = useState<Role[] | null | undefined>([]);
  const t = useT();

  useEffect(() => {
    setRequestRoles(project?.requestRoles);
  }, [project?.requestRoles]);

  const saveDisabled = useMemo(() => {
    if (!requestRoles || !project?.requestRoles) return false;
    if (requestRoles.length !== project?.requestRoles.length) return false;
    const sortedArray1 = requestRoles.slice().sort();
    const sortedArray2 = project?.requestRoles.slice().sort();

    return sortedArray1.every((element, index) => element === sortedArray2[index]);
  }, [project?.requestRoles, requestRoles]);

  const columns: TableColumnsType<RequestOptionsData> = [
    {
      title: t("Role"),
      dataIndex: "role",
      key: "role",
    },
    {
      title: t("Need request"),
      dataIndex: "needRequest",
      key: "needRequest",
      align: "right",
    },
  ];

  const dataSource: RequestOptionsData[] | undefined = useMemo(() => {
    const columns = [
      {
        id: "OWNER",
        key: "OWNER",
        role: "Owner",
        needRequest: (
          <Switch
            checked={requestRoles?.includes("OWNER")}
            onChange={(value: boolean) => {
              if (!Array.isArray(requestRoles)) {
                setRequestRoles([]);
              }
              if (value) {
                setRequestRoles(roles => [...(roles as Role[]), "OWNER"]);
              } else {
                setRequestRoles(requestRoles?.filter(role => role !== "OWNER"));
              }
            }}
          />
        ),
      },
      {
        id: "MAINTAINER",
        key: "MAINTAINER",
        role: "Maintainer",
        needRequest: (
          <Switch
            checked={requestRoles?.includes("MAINTAINER")}
            onChange={(value: boolean) => {
              if (!Array.isArray(requestRoles)) {
                setRequestRoles([]);
              }
              if (value) {
                setRequestRoles(roles => [...(roles as Role[]), "MAINTAINER"]);
              } else {
                setRequestRoles(requestRoles?.filter(role => role !== "MAINTAINER"));
              }
            }}
          />
        ),
      },
      {
        id: "WRITER",
        key: "WRITER",
        role: "Writer",
        needRequest: (
          <Switch
            checked={requestRoles?.includes("WRITER")}
            onChange={(value: boolean) => {
              if (!Array.isArray(requestRoles)) {
                setRequestRoles([]);
              }
              if (value) {
                setRequestRoles(roles => [...(roles as Role[]), "WRITER"]);
              } else {
                setRequestRoles(requestRoles?.filter(role => role !== "WRITER"));
              }
            }}
          />
        ),
      },
      {
        id: "READER",
        key: "READER",
        role: "Reader",
        needRequest: (
          <Switch
            checked={requestRoles?.includes("READER")}
            onChange={(value: boolean) => {
              if (!Array.isArray(requestRoles)) {
                setRequestRoles([]);
              }
              if (value) {
                setRequestRoles(roles => [...(roles as Role[]), "READER"]);
              } else {
                setRequestRoles(requestRoles?.filter(role => role !== "READER"));
              }
            }}
            disabled={true}
          />
        ),
      },
    ];

    return columns;
  }, [requestRoles]);

  const handleRequestRoleChange = useCallback(() => {
    onProjectRequestRolesUpdate(requestRoles);
  }, [onProjectRequestRolesUpdate, requestRoles]);

  return (
    <>
      <SeondaryText>
        {t("If this option is chosen, all new model within the project will default follow it")}
      </SeondaryText>
      <TableWrapper>
        <Table dataSource={dataSource} columns={columns} pagination={false} />
      </TableWrapper>
      <Button
        type="primary"
        disabled={saveDisabled}
        htmlType="submit"
        onClick={handleRequestRoleChange}>
        {t("Save changes")}
      </Button>
    </>
  );
};

export default ProjectRequestOptions;

const SeondaryText = styled.div`
  color: #00000073;
`;

const TableWrapper = styled.div`
  margin: 24px 0;
  max-width: 400px;
`;
