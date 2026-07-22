import RutaProtegida from '../../components/RutaProtegida';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

export default function ProtegidoLayout({ children }) {
  return (
    <RutaProtegida>
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </RutaProtegida>
  );
}
