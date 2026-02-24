import MasterTablePage from '../components/master/MasterTablePage';

export default function ColorMasterPage() {
  return (
<MasterTablePage
  title="Colors"
  entityName="Color"
  getListEndpoint="GetColorList"
  addEndpoint="AddColor"
  editEndpoint="EditColor"
  blockEndpoint="BlockColor"
  idField="color_id"
  nameField="color_name"
  apiIdField="ColorId"
  apiNameField="ColorName"
/>
  );
}