import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { ReaderScreen } from './screens/ReaderScreen';
import { ReviewPaymentScreen } from './screens/ReviewPaymentScreen';
import { ProcessingScreen } from './screens/ProcessingScreen';
import { ResultScreen } from './screens/ResultScreen';
import { WalletScreen } from './screens/WalletScreen';
import { AssetDetailScreen } from './screens/AssetDetailScreen';
import { AddFundsScreen } from './screens/AddFundsScreen';
import { ReceiveCryptoScreen } from './screens/ReceiveCryptoScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { ActivityDetailScreen } from './screens/ActivityDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { BottomNav } from './components/BottomNav';
import { PaymentProvider } from './context/PaymentContext';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const location = useLocation();

  // A barra inferior aparece somente nestas 5 telas:
  const showBottomNav = [
    '/',
    '/carteira',
    '/pagar',
    '/atividade',
    '/perfil',
  ].includes(location.pathname);

  return (
    <div className="nexo-app-frame">
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Tela Início (Entregue completa na W0) */}
          <Route path="/" element={<HomeScreen />} />

          {/* Fluxo Pagar (Entregue completo na W1) */}
          <Route path="/pagar" element={<ReaderScreen />} />
          <Route path="/pagar/revisar" element={<ReviewPaymentScreen />} />
          <Route path="/pagar/processando" element={<ProcessingScreen />} />
          <Route path="/pagar/resultado" element={<ResultScreen />} />

          {/* Fluxo Carteira & Gestão de Cripto (Entregue completo na W2) */}
          <Route path="/carteira" element={<WalletScreen />} />
          <Route path="/carteira/ativo" element={<AssetDetailScreen />} />
          <Route path="/adicionar-fundos" element={<AddFundsScreen />} />
          <Route path="/receber" element={<ReceiveCryptoScreen />} />

          {/* Fluxo Atividade (Entregue completo na W3) */}
          <Route path="/atividade" element={<ActivityScreen />} />
          <Route path="/atividade/detalhe" element={<ActivityDetailScreen />} />

          {/* Perfil & Ações de Segurança (Entregue completo na W3) */}
          <Route path="/perfil" element={<ProfileScreen />} />

          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Barra de navegação inferior exibida nas rotas designadas */}
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <ToastProvider>
          <PaymentProvider>
            <AppContent />
          </PaymentProvider>
        </ToastProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
