import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import Breadcrumb from '../Breadcrumb';

export default function PageLayout({ title, children }) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <div className="flex flex-col flex-1 overflow-hidden p-5">
          <div className="flex justify-between items-center mb-4 mt-2">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">
              {title}
            </h2>
            <Breadcrumb />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}