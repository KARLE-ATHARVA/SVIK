import MasterTablePage from '../components/master/MasterTablePage';

export default function FinishMasterPage() {
  return (
<MasterTablePage
  title="Finish"
  entityName="Finish"
  getListEndpoint="GetFinishList"
  addEndpoint="AddFinish"
  editEndpoint="EditFinish"
  blockEndpoint="BlockFinish"
  idField="finish_id"
  nameField="finish_name"
  apiIdField="FinishId"
  apiNameField="FinishName"
/>
  );
}