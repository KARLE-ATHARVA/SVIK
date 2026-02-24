import MasterTablePage from '../components/master/MasterTablePage';

export default function SpaceMasterPage() {
  return (
<MasterTablePage
  title="Space"
  entityName="Space"
  getListEndpoint="GetSpaceList"
  addEndpoint="AddSpace"
  editEndpoint="EditSpace"
  blockEndpoint="BlockSpace"
  idField="space_id"
  nameField="space_name"
  apiIdField="SpaceId"
  apiNameField="SpaceName"
/>
  );
}