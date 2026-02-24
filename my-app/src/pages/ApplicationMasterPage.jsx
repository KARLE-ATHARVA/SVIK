import MasterTablePage from '../components/master/MasterTablePage';

export default function ApplicationMasterPage() {
  return (
    <MasterTablePage
      title="Applications"
      entityName="Application"
      getListEndpoint="GetApplicationList"
      addEndpoint="AddApplication"
      editEndpoint="EditApplication"
      blockEndpoint="BlockApplication"
      idField="app_id"
      nameField="app_name"
      apiIdField="AppId"
      apiNameField="AppName"
    />
  );
}