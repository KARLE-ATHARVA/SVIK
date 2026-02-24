import MasterTablePage from '../components/master/MasterTablePage';

export default function CategoryMasterPage() {
  return (
    <MasterTablePage
  title="Categories"
  entityName="Category"
  getListEndpoint="GetCategoryList"
  addEndpoint="AddCategory"
  editEndpoint="EditCategory"
  blockEndpoint="BlockCategory"
  idField="cat_id"
  nameField="cat_name"
  apiIdField="CatId"
  apiNameField="CatName"
/>
  );
}