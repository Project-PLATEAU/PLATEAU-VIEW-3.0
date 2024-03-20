import styled from "@emotion/styled";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import MyIntegrationSettings from "@reearth-cms/components/molecules/MyIntegrations/Settings";
import {
  Integration,
  WebhookTrigger,
} from "@reearth-cms/components/molecules/MyIntegrations/types";
import Webhook from "@reearth-cms/components/molecules/MyIntegrations/Webhook";

type Props = {
  integration: Integration;
  webhookInitialValues?: any;
  onIntegrationUpdate: (data: { name: string; description: string; logoUrl: string }) => void;
  onIntegrationDelete: () => Promise<void>;
  onWebhookCreate: (data: {
    name: string;
    url: string;
    active: boolean;
    trigger: WebhookTrigger;
    secret: string;
  }) => Promise<void>;
  onWebhookDelete: (webhookId: string) => Promise<void>;
  onWebhookUpdate: (data: {
    webhookId: string;
    name: string;
    url: string;
    active: boolean;
    trigger: WebhookTrigger;
    secret?: string;
  }) => Promise<void>;
  onIntegrationHeaderBack: () => void;
  onWebhookSelect: (id: string) => void;
};

const MyIntegrationContent: React.FC<Props> = ({
  integration,
  webhookInitialValues,
  onIntegrationUpdate,
  onWebhookCreate,
  onWebhookDelete,
  onWebhookUpdate,
  onIntegrationHeaderBack,
  onIntegrationDelete,
  onWebhookSelect,
}) => {
  const { TabPane } = Tabs;

  return (
    <MyIntegrationWrapper>
      <PageHeader title={integration.name} onBack={onIntegrationHeaderBack} />
      <MyIntegrationTabs defaultActiveKey="integration">
        <TabPane tab="General" key="integration">
          <MyIntegrationSettings
            integration={integration}
            onIntegrationUpdate={onIntegrationUpdate}
            onIntegrationDelete={onIntegrationDelete}
          />
        </TabPane>
        <TabPane tab="Webhook" key="webhooks">
          <Webhook
            integration={integration}
            webhookInitialValues={webhookInitialValues}
            onWebhookCreate={onWebhookCreate}
            onWebhookDelete={onWebhookDelete}
            onWebhookUpdate={onWebhookUpdate}
            onWebhookSelect={onWebhookSelect}
          />
        </TabPane>
      </MyIntegrationTabs>
    </MyIntegrationWrapper>
  );
};

const MyIntegrationWrapper = styled.div`
  min-height: 100%;
  background-color: #fff;
`;

const MyIntegrationTabs = styled(Tabs)`
  padding: 0 24px;
`;

export default MyIntegrationContent;
