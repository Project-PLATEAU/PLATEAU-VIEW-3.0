import Form from "@reearth-cms/components/atoms/Form";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import ReferenceFormItem from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { FormItem } from "@reearth-cms/components/molecules/Content/types";
import { Field } from "@reearth-cms/components/molecules/Schema/types";

interface ReferenceFieldProps {
  field: Field;
  itemGroupId?: string;
  linkedItemsModalList?: FormItem[];
  formItemsData: FormItem[];
  linkItemModalTitle: string;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onReferenceModelUpdate: (modelId: string, referenceFieldId: string) => void;
  onSearchTerm: (term?: string) => void;
  onLinkItemTableReload: () => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
}

const ReferenceField: React.FC<ReferenceFieldProps> = ({
  field,
  itemGroupId,
  linkedItemsModalList,
  formItemsData,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onSearchTerm,
  onLinkItemTableReload,
  onLinkItemTableChange,
}) => {
  return (
    <Form.Item
      extra={field.description}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
      <ReferenceFormItem
        key={field.id}
        correspondingFieldId={field.id}
        formItemsData={formItemsData}
        modelId={field.typeProperty?.modelId}
        titleFieldId={field.typeProperty?.schema?.titleFieldId}
        onReferenceModelUpdate={onReferenceModelUpdate}
        linkItemModalTitle={linkItemModalTitle}
        linkedItemsModalList={linkedItemsModalList}
        linkItemModalTotalCount={linkItemModalTotalCount}
        linkItemModalPage={linkItemModalPage}
        linkItemModalPageSize={linkItemModalPageSize}
        onSearchTerm={onSearchTerm}
        onLinkItemTableReload={onLinkItemTableReload}
        onLinkItemTableChange={onLinkItemTableChange}
      />
    </Form.Item>
  );
};

export default ReferenceField;
