import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../../pages/home/HomePage';
import AllowanceMenu from '../../pages/allowance/AllowanceMenuPage';

// 실제 컴포넌트들은 import하지 않고 주석으로 표시
// import ContractForm from './ContractForm';
// import ContractPreview from './ContractPreview';
// import AllowanceCalculator from './AllowanceCalculator';

function AppLayout() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 
        <Route path="/contract" element={<ContractForm />} />
        <Route path="/contract-preview" element={<ContractPreview />} />
        <Route path="/allowance" element={<AllowanceCalculator />} />
        <Route path="/allowance/monthly" element={<AllowanceCalculator />} />
        <Route path="/allowance/hourly" element={<AllowanceCalculator />} />
        <Route path="/allowance/budget" element={<AllowanceCalculator />} />
        */}
        <Route path="/allowance-menu" element={<AllowanceMenu />} />
      </Routes>
    </Router>
  );
}

export default AppLayout; 