import MasterTablePage from '../components/master/MasterTablePage';

export default function SizeMasterPage() {
  return (
<MasterTablePage
  title="Size"
  entityName="Size"
  getListEndpoint="GetSizeList"
  addEndpoint="AddSize"
  editEndpoint="EditSize"
  blockEndpoint="BlockSize"
  idField="size_id"
  nameField="size_name"
  apiIdField="SizeId"
  apiNameField="SizeName"
/>
  );
}